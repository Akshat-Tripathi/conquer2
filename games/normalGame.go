package game

import (
	"net/http"
	"time"
)

const troopInterval = time.Second * 60

//RealTimeGame - a subclass of game where actions happen as they are sent
type RealTimeGame struct {
	game
}

//Start - starts a game
func (rtg *RealTimeGame) Start(id string) {
	http.HandleFunc("/game/"+id+"/", rtg.handleNewPlayer)
	rtg.processActions()
}
