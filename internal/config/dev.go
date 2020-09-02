// +build dev

package config

import (
	"net/http"

	"github.com/gorilla/websocket"
)

//Upgrader allows websockets from other ports to connect
var Upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

//GameLocation is used to redirect to the yarn start version
const GameLocation = "http://localhost:3000/game"
