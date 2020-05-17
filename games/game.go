package game

import (
	"net/http"
	"sync/atomic"
	"time"
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

const (
	maxCountries = 20
)

//Game - the set of methods that every game should be able to perform
type Game interface {
	Start(id string)
}

//game - basic test version
type game struct {
	id           string
	conn         connectionManager
	numPlayers   int32
	maxPlayerNum int32
	actions      chan Action
	processor    stateProcessor
}

func (g *game) handleNewPlayer(w http.ResponseWriter, r *http.Request) {
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
	name := g.processor.addPlayer(cookie.Value)
	g.conn.Monitor(name, conn, g.actions)
}

func (g *game) processActions() {
	for action := range g.actions {
		won, msg1, msg2 := g.processor.processAction(action)
		g.send(msg1)
		g.send(msg2)
		if won {
			go func() {
				time.Sleep(time.Second * 5)
				close(g.actions)
			}()
		}
	}
}

func (g *game) send(msg UpdateMessage) {
	if msg.Type == "updateTroops" {
		g.conn.sendToPlayer(msg, msg.Player)
		return
	}
	g.conn.sendToAll(msg)
}
