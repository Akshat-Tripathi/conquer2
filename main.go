package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

var (
	neighbours = loadMap()
)

type Home struct {
	Title string
}

func main() {
	fmt.Println(neighbours["A"])

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	r := gin.Default()

	r.Use(static.Serve("/static", static.LocalFile("./frontend/home", true)))

	r.LoadHTMLGlob("frontend/home/*.html")
	r.GET("/abc", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", Home{"Akshat"})
	})
	r.Run(":" + port)
}
