package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/Akshat-Tripathi/conquer2/game"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
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
	colours := loadColours() //Temporary

	games := make(map[string]game.Game)

	r := gin.Default()

	//TEST CODE - REMOVE IN PRODUCTION
	ctx := game.Context{
		ID:                    "test",
		MaxPlayerNumber:       20,
		StartingTroopNumber:   10,
		StartingCountryNumber: 5,
		Situation:             situations["world"],
		Colours:               colours,
		TroopInterval:         time.Second * 10,
	}

	g := &game.RealTimeGame{DefaultGame: new(game.DefaultGame), Router: r}
	games["test"] = g
	games["test"].Start(ctx)
	games["test"].AddPlayer("Akshat", "asdf")

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

		var g game.Game
		switch req.FormValue("type") {
		case "realtime":
			g = &game.RealTimeGame{DefaultGame: new(game.DefaultGame), Router: r}
		case "campaign":
			g = &game.CampaignGame{DefaultGame: new(game.DefaultGame), Router: r}
		}
		g.Start(ctx)
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
		fmt.Println("joining")
		req := c.Request
		req.ParseForm()

		username := req.FormValue("username")
		password := req.FormValue("password")
		situation := req.FormValue("situation")

		//TODO remove this
		if situation == "" {
			situation = "world"
		}

		id := req.FormValue("id")
		thisGame, validID := games[id]
		if !validID {
			redirect("Invalid game ID", c)
		}
		fmt.Println(username, password)
		switch thisGame.CheckPlayer(username, password) {
		case 0:
			if !thisGame.AddPlayer(username, password) {
				redirect("Game full", c)
			}
			fallthrough
		case 1:
			c.SetCookie("id", id, cookieMaxAge, "/game", "", false, false)
			c.SetCookie("username", username, cookieMaxAge, "/game", "", false, false)
			c.SetCookie("password", password, cookieMaxAge, "/game", "", false, true)
			c.SetCookie("situation", situation, cookieMaxAge, "/game", "", false, false)
			c.Redirect(http.StatusFound, "/game")
		default:
			redirect("Invalid username/password combo", c)
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

func redirect(msg string, c *gin.Context) {
	fmt.Fprint(c.Writer, `<script>
			alert("`+msg+`");
			window.location.replace(window.location.href.replace("/join", ""));
			</script>`)
}
