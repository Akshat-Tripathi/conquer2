package game

import (
	"net/http"
	"sync/atomic"
)

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
	Start(id string)
}

//game - basic test version
type game struct {
	id                  string
	countryStates       map[string]*countryState //Maps countries to players / number of troops
	playerTroops        map[string]*int
	conn                connectionManager
	numPlayers          int32
	maxPlayerNum        int32
	startingTroopNumber int
	actions             chan Action
}

//Handle - a handles all new players
func (g *game) Handle(w http.ResponseWriter, r *http.Request) {
	if g.numPlayers >= g.maxPlayerNum {
		http.Redirect(w, r, "/gamefull", http.StatusFound)
	}
	atomic.AddInt32(&g.numPlayers, 1)
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic(err)
	}
	cookie, err := r.Cookie("username")
	if err != nil {
		panic(err)
	}
	name := cookie.Value
	_, ok := g.playerTroops[name]
	for ok {
		name = generateFakeName(name)
		_, ok = g.playerTroops[name]
	}
	g.playerTroops[name] = &g.startingTroopNumber
	g.conn.Monitor(name, conn, g.actions)
}

func (g *game) processAction(act Action) {
	switch action := act.(type) {
	case Attack:
		if g.validateAttack(action) {
			//Attacking code
		}
	case Donate:
		if g.validateDonate(action) {
			*g.playerTroops[action.Player] -= action.Troops //Might cause error
			*g.playerTroops[g.countryStates[action.Dest].player] += action.Troops
		}
	case Move:
		if g.validateMove(action) {
			g.countryStates[action.Src].troops -= action.Troops
			g.countryStates[action.Dest].troops += action.Troops
		}
	case Drop:
		if g.validateDrop(action) {
			g.countryStates[action.Src].troops -= action.Troops
			g.countryStates[action.Dest].troops += action.Troops
		}
	}
}

func (g game) validateAttack(attack Attack) bool {
	src := g.countryStates[attack.Src]
	destPlayer := g.countryStates[attack.Dest].player
	//Must own src
	if src.player != attack.Player {
		return false
	}
	//Mustn't own dest
	if destPlayer == attack.Player {
		return false
	}
	//Can't attack self
	if src.player == destPlayer {
		return false
	}
	//Must have 2+ troops to attack
	if src.troops < 2 {
		return false
	}
	return true
}

func (g game) validateDonate(donate Donate) bool {
	//Must have troops
	if *g.playerTroops[donate.Player] < donate.Troops {
		return false
	}
	//Can't donate to self
	if g.countryStates[donate.Dest].player == donate.Player {
		return false
	}
	return true
}

func (g game) validateMove(move Move) bool {
	src := g.countryStates[move.Src]
	//Must have troops
	if src.troops < move.Troops {
		return false
	}
	if src.player != move.Player {
		return false
	}
	//Must own dest
	if g.countryStates[move.Dest].player == move.Player {
		return false
	}
	return true
}

func (g game) validateDrop(drop Drop) bool {
	//Must have troops
	if *g.playerTroops[drop.Player] < drop.Troops {
		return false
	}
	//Can't donate to self
	if g.countryStates[drop.Dest].player == drop.Player {
		return false
	}
	return true
}
