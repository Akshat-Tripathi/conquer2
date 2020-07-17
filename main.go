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

	//gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	client, games := loadGames(colours, r)

	r.Use(static.Serve("/", static.LocalFile("./build", true)))
	r.Use(static.Serve("/game", static.LocalFile("./build", true)))
	r.Use(static.Serve("/game_intro", static.LocalFile("./build", true)))
	r.Use(static.Serve("/maps/", static.LocalFile("./maps", true)))

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
			Colours:           colours,
			Client:            client,
		}

		g := func() game.Game {
			switch req.FormValue("type") {
			case "realtime":
				g := &game.DefaultGame{}
				g.Init(ctx)
				return g
			case "campaign":
				year, month, day := time.Now().Date()
				ctx.StartTime = time.Date(year, month, day, 0, 0, 0, 0, time.Now().Location())
				g := &game.CampaignGame{}
				g.Init(ctx)
				return g
			default:
				fmt.Println(req.FormValue("type"))
				return nil
			}
		}()

		games[id] = g
		r.GET("/game/"+id+"/ws", g.Run())

		//Sets a cookie for the current game id
		//Avoids the issue of opening loads of connections
		c.SetCookie("id", id, cookieMaxAge, "/game", "", false, false)
		c.SetCookie("username", username, cookieMaxAge, "/game", "", false, false)
		c.SetCookie("password", password, cookieMaxAge, "/game", "", false, true)
		c.SetCookie("situation", situation, cookieMaxAge, "/game", "", false, false)

		c.Redirect(http.StatusFound, "/game")
	})

	r.POST("/join", func(c *gin.Context) {
		req := c.Request
		req.ParseForm()

		username := req.FormValue("username")
		password := req.FormValue("password")

		id := req.FormValue("id")
		_, validID := games[id]
		if !validID {
			fmt.Fprint(c.Writer, `<script>
			alert("Invalid game ID");
			window.location.replace(window.location.href.replace("/join", ""));
			</script>`)
			return
		}
		c.SetCookie("id", id, cookieMaxAge, "/game", "", false, false)
		c.SetCookie("username", username, cookieMaxAge, "/game", "", false, false)
		c.SetCookie("password", password, cookieMaxAge, "/game", "", false, true)

		c.Redirect(http.StatusFound, "/game")
	})

	r.GET("/", func(c *gin.Context) {
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

func loadGames(colours []string, r *gin.Engine) (*firestore.Client, map[string]game.Game) {
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
			g := &game.CampaignGame{}
			g.Init(game.Context{
				ID:      refs.ID,
				Colours: colours,
				Client:  client,
			})
			games[refs.ID] = g
			r.GET("/game/"+refs.ID+"/ws", g.Run())
		}
	}
	return client, games
}
