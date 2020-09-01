package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"github.com/Akshat-Tripathi/conquer2/internal/chat"
	"github.com/Akshat-Tripathi/conquer2/internal/game"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

const (
	cookieMaxAge = 365 * 24 * 60 * 60
)

func main() {
	port := os.Getenv("PORT")

	if port == "" {
		port = "80"
	}

	colours := loadColours()

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	events := make(chan game.Event)

	client, games := loadGames(colours, r, events)
	publicGames := newGameSubset()
	leaderBoard := newLeaderBoard()
	rooms := make(map[string]*chat.Room)

	go func() {
		for {
			event := <-events
			switch event.Event {
			case game.StoppedAccepting:
				publicGames.remove(event.ID)
			case game.PlayerLost:
				leaderBoard.push(event.ID, event.Data.(string))
			case game.Finished:
				leaderBoard.flush("localhost", event.ID)
				delete(games, event.ID)
				delete(rooms, event.ID)
			}
		}
	}()

	ctx := game.Context{
		ID:                "001f91",
		MaxPlayers:        3,
		Minutes:           1,
		Situation:         "world",
		StartingCountries: 20,
		StartingTroops:    100,
		StartTime:         time.Now().Add(time.Minute * 0),
		Colours:           colours,
		Client:            client,
		EventListener:     events,
	}

	g := game.NewDefaultGame(ctx)
	games["001f91"] = g
	c := chat.NewRoom()
	rooms["001f91"] = c
	r.GET("/chat/001f91/ws", c.Handle)
	r.GET("/game/001f91/ws", g.Run())

	r.Use(static.Serve("/", static.LocalFile("./build", true)))
	r.Use(static.Serve("/game", static.LocalFile("./build", true)))
	r.Use(static.Serve("/game_intro", static.LocalFile("./build", true)))
	r.Use(static.Serve("/play", static.LocalFile("./build", true)))
	r.Use(static.Serve("/maps/", static.LocalFile("./maps", true)))
	r.Use(static.Serve("/forums", static.LocalFile("./build", true)))
	r.Use(static.Serve("/tutorial", static.LocalFile("./build", true)))

	r.LoadHTMLGlob("./**/*.html")

	r.GET("/maps/", func(c *gin.Context) {
		c.File("world.txt")
	})

	r.POST("/create", func(c *gin.Context) {
		req := c.Request
		req.ParseForm()

		username := req.FormValue("username")
		password := req.FormValue("password")
		situation := req.FormValue("situation")

		if situation == "" {
			situation = "world"
		}

		id := genID()
		for _, ok := games[id]; ok; _, ok = games[id] {
			id = genID()
		}
		maxPlayers, err := strconv.Atoi(req.FormValue("maxPlayers"))
		if err != nil || maxPlayers < 1 {
			log.Fatal(err)
		}

		startingTroops, err := strconv.Atoi(req.FormValue("startingTroops"))
		if err != nil || startingTroops < 0 {
			log.Fatal(err)
		}

		startingCountries, err := strconv.Atoi(req.FormValue("startingCountries"))
		if err != nil || startingCountries < 1 {
			log.Fatal(err)
		}

		minutes, err := strconv.Atoi(req.FormValue("troopInterval"))
		if err != nil || minutes < 1 {
			log.Fatal(err)
		}

		ctx := game.Context{
			ID:                id,
			MaxPlayers:        maxPlayers,
			Minutes:           minutes,
			Situation:         situation,
			StartingCountries: startingCountries,
			StartingTroops:    startingTroops,
			Colours:           shuffle(colours),
			Client:            client,
		}

		gameType := req.FormValue("type")

		g := func() game.Game {
			switch gameType {
			case "realtime":
				g := game.NewDefaultGame(ctx)
				return g
			case "campaign":
				year, month, day := time.Now().Date()
				ctx.StartTime = time.Date(year, month, day, 0, 0, 0, 0, time.Now().Location())
				g := game.NewCampaignGame(ctx)
				return g
			case "capital":
				g := game.NewCapitalGame(ctx)
				return g
			default:
				fmt.Println(req.FormValue("type"))
				return nil
			}
		}()

		private := req.FormValue("private")
		if private == "" {
			publicGames.add(id, &g)
		}

		room := chat.NewRoom()

		games[id] = g
		rooms[id] = room
		r.GET("/game/"+id+"/ws", g.Run())
		r.GET("/chat/"+id+"/ws", room.Handle)

		//Sets a cookie for the current game id
		//Avoids the issue of opening loads of connections
		c.SetCookie("id", id, cookieMaxAge, "/game", "", false, false)
		c.SetCookie("username", username, cookieMaxAge, "/", "", false, false)
		c.SetCookie("password", password, cookieMaxAge, "/", "", false, true)
		c.SetCookie("situation", situation, cookieMaxAge, "/game", "", false, false)
		c.SetCookie("type", gameType, cookieMaxAge, "/game", "", false, false)
		c.SetCookie("start", strconv.FormatInt(ctx.StartTime.Unix(), 10), cookieMaxAge, "/game", "", false, false)
		if gameType == "realtime" {
			c.SetCookie("interval", strconv.Itoa(minutes), cookieMaxAge, "/game", "", false, false)
		}

		c.Redirect(http.StatusFound, "/game")
	})

	r.POST("/join", func(c *gin.Context) {
		req := c.Request
		req.ParseForm()
		reason := "Invalid game ID"

		username := req.FormValue("username")
		password := req.FormValue("password")

		id := req.FormValue("id")

		if id == "" {
			id = publicGames.find(username, password)
			if id == "NOOP" {
				reason = "No public games are available right now"
			}
		}

		g, validID := games[id]
		if !validID {
			fmt.Fprint(c.Writer, `<script>alert(`+reason+`);
			window.location.replace(window.location.href.replace("/join", ""));
			</script>`)
			return
		}
		ctx := g.GetContext()
		c.SetCookie("id", id, cookieMaxAge, "/game", "", false, false)
		c.SetCookie("username", username, cookieMaxAge, "/", "", false, false)
		c.SetCookie("password", password, cookieMaxAge, "/", "", false, true)
		c.SetCookie("situation", ctx.Situation, cookieMaxAge, "/game", "", false, false)
		c.SetCookie("start", strconv.FormatInt(ctx.StartTime.Unix(), 10), cookieMaxAge, "/game", "", false, false)

		switch g.(type) {
		case *game.CapitalGame:
			c.SetCookie("type", "capital", cookieMaxAge, "/game", "", false, false)
		case *game.DefaultGame:
			c.SetCookie("type", "realtime", cookieMaxAge, "/game", "", false, false)
			c.SetCookie("interval", strconv.Itoa(ctx.Minutes), cookieMaxAge, "/game", "", false, false)
		case *game.CampaignGame:
			c.SetCookie("type", "campaign", cookieMaxAge, "/game", "", false, false)
		}

		c.Redirect(http.StatusFound, "/game")
	})

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})

	r.GET("/play", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})

	r.GET("/game", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})
	r.GET("/game_intro", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})

	r.Run(":" + port)
}

func loadGames(colours []string, r *gin.Engine, events chan<- game.Event) (*firestore.Client, map[string]game.Game) {
	auth := option.WithCredentialsFile("./internal/game/conquer2.json")
	app, err := firebase.NewApp(context.Background(), nil, auth)
	if err != nil {
		log.Fatalln(err)
	}
	client, err := app.Firestore(context.Background())

	if err != nil {
		log.Println("Error retrieving saved games")
		return client, make(map[string]game.Game)
	}

	allRefs, err := client.Collections(context.Background()).GetAll()

	games := make(map[string]game.Game)
	if err == nil {
		for _, refs := range allRefs {
			g := game.NewCampaignGame(game.Context{
				ID:            refs.ID,
				Colours:       colours,
				Client:        client,
				EventListener: events,
			})
			games[refs.ID] = g
			r.GET("/game/"+refs.ID+"/ws", g.Run())
		}
	}
	return client, games
}
