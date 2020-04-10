package game

import "net/http"

/*
Game types:
Normal
Situation: Reenact different historical scenarios
Historic: Time progression

Responsibilities:
A game object will be created by a player, when they choose to host a game.
The initialisation code will be run.
When the game receives an action as input, it validates it then processes it, and finally sends the action to the appropriate clients
*/

//Game - the set of methods that every game should be able to perform
type Game interface {
	Handle(w http.ResponseWriter, r *http.Request) //When a game is created, http.addHandlerFunc this
	processAction(*Action) bool
	validateAction(*Action) bool
	saveGameState()
}
