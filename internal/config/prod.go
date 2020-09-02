// +build !dev

package config

import "github.com/gorilla/websocket"

//Upgrader is the default Upgrader
var Upgrader = websocket.Upgrader{}

//GameLocation is used to redirect to the production version
const GameLocation = "/game"
