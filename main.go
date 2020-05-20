package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
	"strconv"

	"github.com/Akshat-Tripathi/conquer2/game"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

const (
	cookieMaxAge   = 365 * 24 * 60 * 60
	totalCountries = 200
)

func pain() {
	router := gin.Default()
	// Serve frontend static files
	router.Use(static.Serve("/", static.LocalFile("./frontend/build", true)))

	// Setup route group for the API
	api := router.Group("/api")
	{
		api.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "pong",
			})
		})
	}
	router.Run(":5000")
}

func main() {

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	neighbours := loadMap()

	games := make(map[string]game.Game)

	r := gin.Default()

	ctx := game.Context{
		ID:                    "test",
		MaxPlayerNumber:       5,
		StartingTroopNumber:   1,
		StartingCountryNumber: 3,
	}

	//TEST CODE - REMOVE IN PRODUCTION
	g := &game.RealTimeGame{DefaultGame: new(game.DefaultGame), Router: r}
	g.Start(ctx, neighbours)
	games["test"] = g
	games["test"].AddPlayer("Akshat", "asdf")

	r.Use(static.Serve("/", static.LocalFile("./frontend/build", true)))

	r.Use(static.Serve("/game", static.LocalFile("./frontend/build", true)))

	r.LoadHTMLGlob("frontend/**/*.html")

	r.POST("/create", func(c *gin.Context) {
		req := c.Request
		req.ParseForm()
		
		username := req.FormValue("username")
		password := req.FormValue("password")
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
		var maxCountries int = totalCountries / maxPlayers
		if maxCountries < startingCountries {
			startingCountries = maxCountries
		}
		
		ctx := game.Context{
			ID:                    id,
			MaxPlayerNumber:       int32(maxPlayers),
			StartingTroopNumber:   startingTroops,
			StartingCountryNumber: startingCountries,
			TroopInterval: time.Duration(troopInterval) * time.Minute,
		}
		
		var g game.Game
		switch req.FormValue("type") {
		case "realtime":
			g = &game.RealTimeGame{DefaultGame: new(game.DefaultGame), Router: r}
		}
		g.Start(ctx, neighbours)
		games[id] = g

		c.SetCookie("username", username, cookieMaxAge, "/game/",
			"", false, true)
			c.SetCookie("password", password, cookieMaxAge, "/game/",
			"", false, true)
		c.SetCookie("id", id, cookieMaxAge, "/game/", //Sets a cookie for the current game id
		"", false, true) //Avoids the issue of opening loads of connections

		games[id].AddPlayer(username, password)
		c.Redirect(http.StatusFound, "/game/")
	})

	r.POST("/join", func(c *gin.Context) {
		req := c.Request
		req.ParseForm()
		
		username := req.FormValue("username")
		password := req.FormValue("password")
	
		id := req.FormValue("id")
		thisGame, validID := games[id]
		if !validID {
			fmt.Fprint(c.Writer, `<script>
								alert("Invalid ID");
								window.location.replace(window.location.href.replace("/join", ""));
								</script>`)
		}
		switch thisGame.CheckPlayer(username, password) {
		case 0:
			if !thisGame.AddPlayer(username, password) {
				fmt.Fprint(c.Writer, `<script>
								alert("Game full");
								window.location.replace(window.location.href.replace("/join", ""));
								</script>`)
			}
			c.SetCookie("username", username, cookieMaxAge, "/game",
				"", false, true)
				c.SetCookie("password", password, cookieMaxAge, "/game",
				"", false, true)
			c.SetCookie("id", id, cookieMaxAge, "/game",
				"", false, true)
			fallthrough
		case 1:
			c.Redirect(http.StatusFound, "/game")
		default:
			fmt.Fprint(c.Writer, `<script>
								alert("Invalid username/password combo");
								window.location.replace(window.location.href.replace("/join", ""));
								</script>`)
		}

	})
	
	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})

	r.GET("/game", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})
	r.Run(":" + port)
}
