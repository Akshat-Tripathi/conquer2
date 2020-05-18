package game

import (
	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{}
)

type connectionManager struct {
	players map[string]chan UpdateMessage
}

//Monitor - monitors a player's websocket
func (c *connectionManager) Monitor(name string, conn *websocket.Conn, msgs chan<- Action) {
	outboundMsgs := make(chan UpdateMessage)
	c.players[name] = outboundMsgs
	var act Action
	for {
		err := conn.ReadJSON(&act)
		if err != nil {
			//log.Fatal("User left - reading")
			delete(c.players, name)
			//msgs <- Action{ActionType: "removeUser", Player: name}
		}
		act.Player = name
		msgs <- act
		select {
		case msg := <-outboundMsgs:
			err = conn.WriteJSON(msg)
			if err != nil {
				//log.Fatal("User left - writing")
				delete(c.players, name)
				//msgs <- Action{ActionType: "removeUser", Player: name}
			}
		}
	}
}

func (c *connectionManager) sendToAll(msg UpdateMessage) {
	for _, v := range c.players {
		v <- msg
	}
}

func (c *connectionManager) sendToPlayer(msg UpdateMessage, player string) {
	c.players[player] <- msg
}

//UpdateMessage - sent to client
type UpdateMessage struct {
	Troops  int    //delta troops
	Type    string //Type of update: updateCountry or updateTroops
	Player  string //Player that owns the country / dest player
	Country string
}
