package game

import (
	"log"

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

//UpdateMessage - sent to client
type UpdateMessage struct {
	Troops  int    //delta troops
	Type    string //Type of update: updateCountry or updateTroops or newPlayer
	Player  string //Player that owns the country / dest player
	Country string //Could be the colour iff the type is newPlayer
}

func (c *connectionManager) read(name string, conn *websocket.Conn) Action {
	var act Action
	err := conn.ReadJSON(&act)
	if err != nil {
		log.Println("read ", err)
		delete(c.players, name)
	}
	act.Player = name
	return act
}

//Monitor - monitors a player's websocket
func (c *connectionManager) monitor(name string, conn *websocket.Conn, msgs chan<- Action) {
	go func() {
		var act Action
		for {
			err := conn.ReadJSON(&act)
			if err != nil {
				log.Println("read ", err)
				delete(c.players, name)
				return
			}
			act.Player = name
			log.Println(act)
			//FIXME
			msgs <- act
		}
	}()
	for {
		if len(c.players) > 0 {
			select {
			case msg := <-c.players[name]:
				err := conn.WriteJSON(msg)
				if err != nil {
					//log.Println("write ", err)
					delete(c.players, name)
					return
				}
			}
		} else {
			log.Println("zero players")
		}
	}
}

func (c *connectionManager) sendToAll(msg UpdateMessage) {
	for _, v := range c.players {
		go func(v chan UpdateMessage) {
			v <- msg
		}(v)
	}
}

func (c *connectionManager) sendToPlayer(msg UpdateMessage, player string) {
	go func() {
		if p, ok := c.players[player]; ok {
			p <- msg
		}
	}()
}
