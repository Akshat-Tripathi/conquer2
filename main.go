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

func main() {
	fmt.Println("build")

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	neighbours := loadMap()

	games := make(map[string]game.Game)

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
			c.Writer.WriteString(`<script>alert("Invalid game id")</script>`)
			return
		}

		username := req.FormValue("username")
		password := req.FormValue("password")
		switch thisGame.CheckPlayer(username, password) {
		case 0:
			c.SetCookie("username", username, cookieMaxAge, "/game/"+id,
				"", false, true)
			c.SetCookie("password", password, cookieMaxAge, "/game/"+id,
				"", false, true)
			thisGame.AddPlayer(username, password)
			fallthrough
		case 1:
			c.Redirect(http.StatusFound, "/game/"+id)
		default:
			c.Writer.WriteString(`<script>alert("Invalid username password combo)"</script>`)
		}
	})

	r.GET("/create/", func(c *gin.Context) {

		test := game.RealTimeGame{DefaultGame: new(game.DefaultGame), Router: r}
		ctx := Context{ID: "test", MaxPlayerNumber: 3, StartingTroopNumber: 5, StartingCountryNumber: 1}
		test.Start(ctx, &neighbours)
		games["test"] = &test
	})

	r.Run(":" + port)
}
