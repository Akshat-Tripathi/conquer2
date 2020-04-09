package game

import (
	"net/http"
	"sync/atomic"
)

//NormalGame - basic test version
type NormalGame struct {
	id                  string
	states              map[string]gameState //Maps countries to players / number of troops
	playerTroops        map[string]int
	conn                connectionManager
	numPlayers          int32
	maxPlayerNum        int32
	startingTroopNumber int
}

//Handle - a handles all new players
func (ng *NormalGame) Handle(w http.ResponseWriter, r *http.Request) {
	if ng.numPlayers < ng.maxPlayerNum {
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
	if _, ok := ng.playerTroops[name]; ok {
		name = generateFakeName(name)
	}
	ng.playerTroops[name] = ng.startingTroopNumber
	ng.conn.Monitor(name, conn)
}
