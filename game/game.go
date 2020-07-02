package game

import (
	"log"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
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

//Game - the set of methods that every DefaultGame should be able to perform
type Game interface {
	Start(Context)
	CheckPlayer(string, string) int8
	AddPlayer(string, string) bool
}

//DefaultGame - basic test version
type DefaultGame struct {
	sync.Mutex
	colours       []string
	id            string
	conn          connectionManager
	numPlayers    int
	maxPlayerNum  int
	requests      chan Action
	processor     stateProcessor
	troopInterval time.Duration
}

//CheckPlayer - checks if a player exists - see stateprocessor.checkPlayer for more info
func (g *DefaultGame) CheckPlayer(name, password string) int8 {
	return g.processor.checkPlayer(name, password)
}

//AddPlayer - returns whether or not the player was successfully added
func (g *DefaultGame) AddPlayer(name, password string) bool {
	g.Lock()
	defer g.Unlock()
	if g.numPlayers >= g.maxPlayerNum {
		return false
	}
	g.processor.addPlayer(name, password, g.colours[g.numPlayers])
	g.numPlayers++
	if g.numPlayers == 1 {
		go g.processTroops()
	}
	return true
}

//Existing players go here
func (g *DefaultGame) handleGame(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Error establishing a websocket connection")
	}
	username, err := c.Cookie("username")
	if err != nil {
		log.Println("no username")
		redirect(conn)
		return
	}
	password, err := c.Cookie("password")
	if err != nil {
		log.Println("no password")
		redirect(conn)
		return
	}
	switch g.CheckPlayer(username, password) {
	case 0:
		fallthrough
	case 2:
		log.Println("no player exists")
		redirect(conn)
		return
	}
	responses := g.conn.register(username)
	for _, msg := range g.processor.getState(username) {
		if msg.Type == "newPlayer" || (msg.Player == username && msg.Troops == 0) {
			g.conn.sendToAll(msg)
		} else {
			g.conn.sendToPlayer(msg, username)
		}
	}
	g.conn.monitor(username, conn, g.requests, responses)
}

func redirect(conn *websocket.Conn) {
	conn.WriteMessage(websocket.CloseMessage, nil)
}

//Takes actions from the websocket connections and processes them
func (g *DefaultGame) processActions() {
	for action := range g.requests {
		won, msg1, msg2 := g.processor.processAction(action)
		g.send(msg1)
		g.send(msg2)
		if won {

			g.numPlayers = 0
			go func() {
				time.Sleep(time.Second * 5)
				close(g.requests)
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
		if func() bool {
			time.Sleep(g.troopInterval)
			for _, v := range g.processor.processTroops() {
				go func(v UpdateMessage) {
					g.conn.sendToPlayer(v, v.Player)
				}(v)
			}
			g.Lock()
			defer g.Unlock()
			return g.numPlayers == 0
		}() {
			break
		}
	}
}
