package game

import (
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{}
)

type connectionManager struct {
	players sync.Map //map[string]chan UpdateMessage
}

func (c *connectionManager) register(name string) chan UpdateMessage {
	responses := make(chan UpdateMessage, 100)
	c.players.Store(name, responses)
	return responses
}

//UpdateMessage - sent to client
type UpdateMessage struct {
	Troops  int    //delta troops
	Type    string //Type of update: updateCountry or updateTroops or newPlayer
	Player  string //Player that owns the country / dest player
	Country string //Could be the colour iff the type is newPlayer
}

//Monitor - monitors a player's websocket
func (c *connectionManager) monitor(name string, conn *websocket.Conn,
	requests chan<- Action, responses chan UpdateMessage) {
	go func() {
		var act Action
		for {
			err := conn.ReadJSON(&act)
			//To check if the message is a keepAlive message from the client
			if act.Player == "" {
				continue
			}
			if err != nil {
				//log.Println("read ", err)
				close(responses)
				c.players.Delete(name)
				return
			}
			act.Player = name
			log.Println(act)
			//FIXME
			requests <- act
		}
	}()
Out:
	for {
		select {
		case msg := <-responses:
			err := conn.WriteJSON(msg)
			if err != nil {
				//log.Println("write ", err)
				c.players.Delete(name)
				break Out
			}
		}
	}
	//fmt.Println("leak avoided")
}

func (c *connectionManager) sendToAll(msg UpdateMessage) {
	c.players.Range(func(k interface{}, v interface{}) bool {
		go func(v chan UpdateMessage) {
			v <- msg
		}(v.(chan UpdateMessage))
		return true
	})
}

func (c *connectionManager) sendToPlayer(msg UpdateMessage, player string) {
	go func() {
		if p, ok := c.players.Load(player); ok {
			p.(chan UpdateMessage) <- msg
		}
	}()
}
