package game

import (
	"log"
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
A DefaultGame object will be created by a player, when they choose to host a DefaultGame.
The initialisation code will be run.
When the DefaultGame receives an action as input, it validates it then processes it, and finally sends the action to the appropriate clients
*/

const (
	maxCountries = 20
)

//Game - the set of methods that every DefaultGame should be able to perform
type Game interface {
	Start(Context, map[string][]string)
	CheckPlayer(string, string) int8
	AddPlayer(string, string) bool
}

//DefaultGame - basic test version
type DefaultGame struct {
	id            string
	conn          connectionManager
	numPlayers    int32
	maxPlayerNum  int32
	actions       chan Action
	processor     stateProcessor
	troopInterval time.Duration
}

//CheckPlayer - checks if a player exists - see stateprocessor.checkPlayer for more info
func (g *DefaultGame) CheckPlayer(name, password string) int8 {
	return g.processor.checkPlayer(name, password)
}

//AddPlayer - returns whether or not the player was successfully added
func (g *DefaultGame) AddPlayer(name, password string) bool {
	if g.numPlayers >= g.maxPlayerNum {
		return false
	}
	atomic.AddInt32(&g.numPlayers, 1)
	g.processor.addPlayer(name, password)
	return true
}

//Existing players go here
func (g *DefaultGame) handleGame(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic(err)
	}
	username, err := r.Cookie("username")
	if err != nil {
		panic(err)
	}
	g.conn.register(username.Value)
	for _, msg := range g.processor.getState(username.Value)[:1] {
		log.Println(msg)
		g.conn.sendToPlayer(msg, username.Value)
	}
	g.conn.monitor(username.Value, conn, g.actions)
}

//Takes actions from the websocket connections and processes them
func (g *DefaultGame) processActions() {
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

//Sends actions to the appropriate clients
func (g *DefaultGame) send(msg UpdateMessage) {
	if msg.Type == "updateTroops" {
		g.conn.sendToPlayer(msg, msg.Player)
		return
	}
	g.conn.sendToAll(msg)
}

func (g *DefaultGame) processTroops() {
	for {
		time.Sleep(g.troopInterval * 1000)
		for _, v := range g.processor.processTroops() {
			g.conn.sendToPlayer(v, v.Player)
		}
	}
}
