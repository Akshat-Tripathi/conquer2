// +build dev

package config

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Upgrader allows websockets from other ports to connect
var (
	Upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

const (
	// GameLocation is used to redirect to the yarn start version
	GameLocation = "http://localhost:3000/game"
	// Mode is debugMode
	Mode = gin.DebugMode
)

// CORSConfig allows localhost:3000 to access /maps/*.txt
func CORSConfig(r *gin.Engine) {
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET"}
	config.AllowFiles = true
	config.ExposeHeaders = []string{"Access-Control-Allow-Origin"}
	r.Use(cors.New(config))
}
