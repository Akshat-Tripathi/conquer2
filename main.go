package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/Akshat-Tripathi/conquer2/game"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

const (
	cookieMaxAge = 365 * 24 * 60 * 60
)

var (
	neighbours = loadMap()
)

func main() {
	fmt.Println("build")

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	games := make(map[string]game.Game)
	games["test"] = new(game.RealTimeGame)

	r := gin.Default()
	r.Use(static.Serve("/static", static.LocalFile("./frontend", true)))

	r.LoadHTMLGlob("frontend/**/*.html")

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})
	r.POST("/", func(c *gin.Context) {
		req := c.Request
		req.ParseForm()
		id := req.FormValue("id")
		thisGame, validID := games[id]
		if !validID {
			c.Redirect(http.StatusFound, "/")
			return
		}

		username := req.FormValue("username")
		password := req.FormValue("password")
		//TODO add addPlayer logic
		if !thisGame.CheckPlayer(username, password) {
			c.SetCookie("username", username, cookieMaxAge, "/game/"+id,
				"", false, true)
			c.SetCookie("password", password, cookieMaxAge, "/game/"+id,
				"", true, true)
			thisGame.AddPlayer(username, password)
		}
		c.Redirect(http.StatusFound, "/game/"+id)
	})

	r.GET("/create/", func(c *gin.Context) {

	})

	r.Run(":" + port)
}
