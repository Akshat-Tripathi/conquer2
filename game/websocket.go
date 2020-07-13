package game

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

//Since every action from a websocket will only be used once it makes sense to
//process actions immediately after they are received

var (
	upgrader = websocket.Upgrader{}
)

type sockets struct {
	players sync.Map //map[string]*websocket.Conn
	close   chan struct{}
}

//Action - sent by the client, it encodes all the information about an action. Player is set by the server
type Action struct {
	Troops     int
	ActionType string
	Src        string
	Dest       string
	Player     string //TODO remove this
}

//UpdateMessage - sent to client
type UpdateMessage struct {
	Troops  int    //delta troops
	Type    string //Type of update: updateCountry or updateTroops or newPlayer or won
	Player  string //Player that owns the country / dest player
	Country string //Could be the colour iff the type is newPlayer
}

func newSockets() *sockets {
	return &sockets{
		players: sync.Map{},
		close:   make(chan struct{}),
	}
}

func (s *sockets) newPlayer(w http.ResponseWriter, r *http.Request, name string) *websocket.Conn {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return nil
	}
	s.players.Store(name, conn)
	return conn
}

//PRE: name is in players
func (s *sockets) listen(name string, process func(string, Action)) {
	c, ok := s.players.Load(name)
	if !ok {
		log.Println("Player doesn't exist - PRE violated")
		return
	}
	conn := c.(*websocket.Conn)
	defer conn.Close()
	var action Action
	for {
		select {
		case <-s.close:
			return
		default:
			err := conn.ReadJSON(&action)
			if err != nil {
				log.Println(err)
				return
			}
			process(name, action)
		}
	}
}

//PRE: the player already exists
func (s *sockets) sendToPlayer(name string, msg UpdateMessage) {
	conn, _ := s.players.Load(name)
	err := conn.(*websocket.Conn).WriteJSON(msg)
	if err != nil {
		log.Println(err)
		return
	}
}

func (s *sockets) sendToAll(msg UpdateMessage) {
	s.players.Range(func(key, value interface{}) bool {
		err := value.(*websocket.Conn).WriteJSON(msg)
		if err != nil {
			log.Println(err)
		}
		return true
	})
}
