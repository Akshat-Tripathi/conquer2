package game

import (
	"net/http"
	"sync/atomic"
)

//NormalGame - basic test version
type NormalGame struct {
	id          string
	state       map[string]gameState
	conn        connectionManager
	numPlayers  int32
	playerLimit int32
}

//Handle - a handles all new players
func (ng *NormalGame) Handle(w http.ResponseWriter, r *http.Request) {
	if ng.numPlayers < ng.playerLimit {
		atomic.AddInt32(&ng.numPlayers, 1)
		http.Redirect(w, r, "/gamefull", http.StatusFound)
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic(err)
	}
	cookie, err := r.Cookie("username")
	if err != nil {
		panic(err)
	}
	name := cookie.Value
	ng.conn.Monitor(name, conn)
}
