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
	"github.com/Akshat-Tripathi/conquer2/game"
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

	situations := loadMaps()
	colours := loadColours()

	games := make(map[string]game.Game)
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	//Load existing games
	client := loadCampaigns(func(ID string, info map[string]interface{}, client *firestore.Client) {
		ctx := game.Context{
			ID:              ID,
			MaxPlayerNumber: info["MaxPlayerNumber"].(int),
			Situation:       situations[info["Situation"].(string)],
			Colours:         colours,
		}
		g := &game.CampaignGame{
			DefaultGame: new(game.DefaultGame),
		}
		g.Init(info["StartTime"].(time.Time), game.NewPersistence(ID, client))
		g.Start(ctx, r)
		games[ID] = g
	})

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
		if err != nil {
			log.Fatal(err)
		}

		startingTroops, err := strconv.Atoi(req.FormValue("startingTroops"))
		if err != nil {
			log.Fatal(err)
		}

		startingCountries, err := strconv.Atoi(req.FormValue("startingCountries"))
		if err != nil {
			log.Fatal(err)
		}

		troopInterval, err := strconv.Atoi(req.FormValue("troopInterval"))
		if err != nil {
			log.Fatal(err)
		}

		ctx := game.Context{
			ID:                    id,
			MaxPlayerNumber:       maxPlayers,
			StartingTroopNumber:   startingTroops,
			StartingCountryNumber: startingCountries,
			TroopInterval:         time.Duration(troopInterval) * time.Minute,
			Situation:             situations[situation],
			Colours:               colours,
		}

		g := func() game.Game {
			switch req.FormValue("type") {
			case "realtime":
				g := &game.RealTimeGame{DefaultGame: new(game.DefaultGame)}
				g.Start(ctx, r)
				return g
			case "campaign":
				year, month, day := time.Now().Date()
				g := &game.CampaignGame{DefaultGame: new(game.DefaultGame)}
				g.Start(ctx, r)
				g.Init(time.Date(year, month, day+1, 0, 0, 0, 0, time.Now().Location()),
					game.NewPersistence(id, client))
				return g
			default:
				fmt.Println(req.FormValue("type"))
				return nil
			}
		}()
		g.AddPlayer(username, password)
		games[id] = g

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
		thisGame, validID := games[id]
		if !validID {
			redirect("Invalid game ID", c)
			return
		}
		switch thisGame.CheckPlayer(username, password) {
		case 0:
			if !thisGame.AddPlayer(username, password) {
				redirect("Game full", c)
				return
			}
			fallthrough
		case 1:
			c.SetCookie("id", id, cookieMaxAge, "/game", "", false, false)
			c.SetCookie("username", username, cookieMaxAge, "/game", "", false, false)
			c.SetCookie("password", password, cookieMaxAge, "/game", "", false, true)
			//c.SetCookie("situation", situation, cookieMaxAge, "/game", "", false, false)
			c.Redirect(http.StatusFound, "/game")
		default:
			redirect("Invalid username/password combo", c)
			return
		}

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

func loadCampaigns(registerGame func(ID string, info map[string]interface{},
	client *firestore.Client)) *firestore.Client {
	auth := option.WithCredentialsFile("./game/conquer2.json")
	app, err := firebase.NewApp(context.Background(), nil, auth)
	if err != nil {
		log.Fatalln(err)
	}
	client, err := app.Firestore(context.Background())

	campaigns, err := client.Collections(context.Background()).GetAll()

	if err == nil {
		for _, campaign := range campaigns {
			info, err := campaign.Doc("ctx").Get(context.Background())
			if err != nil {
				continue
			}
			registerGame(campaign.ID, info.Data(), client)
		}
	}
	return client
}

func testSetup(
	situations map[string]map[string][]string,
	colours []string,
	games map[string]game.Game,
	r *gin.Engine) {
	ctx := game.Context{
		ID:                    "test",
		MaxPlayerNumber:       2,
		StartingTroopNumber:   10,
		StartingCountryNumber: 40,
		Situation:             situations["world"],
		Colours:               colours,
		TroopInterval:         time.Minute * 60,
	}

	g := &game.RealTimeGame{DefaultGame: new(game.DefaultGame)}
	games["test"] = g
	games["test"].Start(ctx, r)
}

func redirect(msg string, c *gin.Context) {
	fmt.Fprint(c.Writer, `<script>
					alert("`+msg+`");
					window.location.replace(window.location.href.replace("/join", ""));
					</script>`)
}
