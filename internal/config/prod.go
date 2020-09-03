// +build !dev

package config

import (
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var (
	//Upgrader is the default Upgrader
	Upgrader = websocket.Upgrader{}
)

const (
	//GameLocation is used to redirect to the production version
	GameLocation = "/game"
	//Mode is releaseMode
	Mode = gin.ReleaseMode
)

//CORSConfig does nothing in production
func CORSConfig(r *gin.Engine) {
}
