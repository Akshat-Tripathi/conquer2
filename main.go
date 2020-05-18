package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/Akshat-Tripathi/conquer2/game"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

const (
	cookieMaxAge = 365 * 24 * 60 * 60
)

func main() {
	fmt.Println("build")

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	neighbours := loadMap()
	fmt.Println(neighbours)

	games := make(map[string]game.Game)

	r := gin.Default()

	r.Use(static.Serve("/static", static.LocalFile("./frontend", true)))

	// r.LoadHTMLGlob("frontend/**/*.html")
	r.LoadHTMLGlob("frontend/public/index.html")

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})
	r.POST("/", func(c *gin.Context) {
		req := c.Request
		req.ParseForm()

		var id string
		username := req.FormValue("username")
		password := req.FormValue("password")

		if req.FormValue("submit") == "create" {
			id = genID()
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

			ctx := game.Context{
				ID:                    id,
				MaxPlayerNumber:       int32(maxPlayers),
				StartingTroopNumber:   startingTroops,
				StartingCountryNumber: startingCountries,
			}

			var g game.Game
			switch req.FormValue("type") {
			case "realtime":
				g = &game.RealTimeGame{DefaultGame: new(game.DefaultGame), Router: r}
			}
			g.Start(ctx, neighbours)
			games[id] = g

			c.SetCookie("username", username, cookieMaxAge, "/game/"+id,
				"", false, true)
			c.SetCookie("password", password, cookieMaxAge, "/game/"+id,
				"", false, true)

			games[id].AddPlayer(username, password)
			c.Redirect(http.StatusFound, "/game/"+id)

		} else {
			id = req.FormValue("id")
			thisGame, validID := games[id]
			if !validID {
				fmt.Fprint(c.Writer, `<script>alert("Invalid ID")</script>`)
				c.HTML(http.StatusOK, "index.html", nil)
				return
			}

			switch thisGame.CheckPlayer(username, password) {
			case 0:
				c.SetCookie("username", username, cookieMaxAge, "/game/"+id,
					"", false, true)
				c.SetCookie("password", password, cookieMaxAge, "/game/"+id,
					"", false, true)
				if !thisGame.AddPlayer(username, password) {
					fmt.Fprint(c.Writer, `<script>alert("Game full")</script>`)
					c.HTML(http.StatusOK, "index.html", nil)
				}
				fallthrough
			case 1:
				c.Redirect(http.StatusFound, "/game/"+id)
			default:
				fmt.Fprint(c.Writer, `<script>alert("Invalid username/password")</script>`)
				c.HTML(http.StatusOK, "index.html", nil)
			}
		}

	})

	r.Run(":" + port)
}
