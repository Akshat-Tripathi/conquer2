package game

import (
	"log"

	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{}
)

type connectionManager struct {
	players map[string]chan Action //TODO - make specific outgoing msg structs if errors
}

//Monitor - monitors a player's websocket
func (c *connectionManager) Monitor(name string, conn *websocket.Conn, msgs chan<- Action) {
	outboundMsgs := make(chan Action)
	c.players[name] = outboundMsgs
	var act action
	for {
		err := conn.ReadJSON(&act)
		if err != nil {
			log.Fatal("User left")
			delete(c.players, name)
			return
		}
		act.Player = name
		msgs <- act
		select {
		case msg := <-outboundMsgs:
			err = conn.WriteJSON(msg)
			if err != nil {
				log.Fatal("User left")
				delete(c.players, name)
				return
			}
		}
	}
}

func (c *connectionManager) sendToAll(msg Action) {
	for _, v := range c.players {
		v <- msg
	}
}

func (c *connectionManager) sendToPlayer(msg Action, player string) {
	c.players[player] <- msg
}
