package game

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{}
)

type connectionManager struct {
	players map[string]chan UpdateMessage
}

func (c *connectionManager) register(name string) {
	c.players[name] = make(chan UpdateMessage)
}

//Monitor - monitors a player's websocket
func (c *connectionManager) monitor(name string, conn *websocket.Conn, msgs chan<- Action) {
	outboundMsgs := c.players[name]
	var act Action
	for {
		if len(c.players) > 0 {
			err := conn.ReadJSON(&act)
			if err != nil {
				log.Fatal("read", err)
			}
			act.Player = name
			msgs <- act
			select {
			case msg := <-outboundMsgs:
				err = conn.WriteJSON(msg)
				if err != nil {
					log.Fatal("write", err)
				}
			}
		}
		time.Sleep(time.Millisecond * 100) //TODO find a better solution with channels
	}
}

func (c *connectionManager) sendToAll(msg UpdateMessage) {
	for _, v := range c.players {
		go func() {
			v <- msg
		}()
	}
}

func (c *connectionManager) sendToPlayer(msg UpdateMessage, player string) {
	go func() {
		c.players[player] <- msg
	}()
}

//UpdateMessage - sent to client
type UpdateMessage struct {
	Troops  int    //delta troops
	Type    string //Type of update: updateCountry or updateTroops
	Player  string //Player that owns the country / dest player
	Country string
}
