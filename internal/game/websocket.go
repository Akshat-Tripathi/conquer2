package game

import (
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

//Since every action from a websocket will only be used once it makes sense to
//process actions immediately after they are received

var (
	upgrader = websocket.Upgrader{}
)

type socket struct {
	responses chan UpdateMessage
	requests  chan Action
	close     chan struct{}
	conn      *websocket.Conn
}

func (s *socket) send(msg UpdateMessage) {
	go func() {
		s.responses <- msg
	}()
}

func (s *socket) read() {
	var action Action
	err := s.conn.ReadJSON(&action)
	if err != nil {
		log.Println(err)
		s.close <- struct{}{}
		return
	}
	s.requests <- action
}

type sockets struct {
	sync.Mutex
	players map[string]*socket
	close   chan struct{}
	handle  func(name string, action Action)
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
	ID      int
}

func newSockets() *sockets {
	return &sockets{
		players: make(map[string]*socket),
		close:   make(chan struct{}),
	}
}

func (s *sockets) newPlayer(w http.ResponseWriter, r *http.Request, name string) *websocket.Conn {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return nil
	}
	s.players[name] = &socket{
		responses: make(chan UpdateMessage),
		requests:  make(chan Action),
		conn:      conn,
	}
	return conn
}

//PRE: name is in players
func (s *sockets) listen(name string) {
	socket, ok := s.players[name]
	if !ok {
		log.Println("Player doesn't exist - PRE violated")
		return
	}
	defer socket.conn.Close()
	defer delete(s.players, name)
	go func() {
		for {
			socket.read()
		}
	}()
	for {
		select {
		case <-s.close:
			return
		case <-socket.close:
			return
		case msg := <-socket.responses:
			err := socket.conn.WriteJSON(msg)
			if err != nil {
				log.Println(err)
			}
		case action := <-socket.requests:
			s.handle(name, action)
		}
	}
}

func (s *sockets) sendToPlayer(name string, msg UpdateMessage) {
	socket, ok := s.players[name]
	if !ok {
		return
	}
	socket.send(msg)
}

func (s *sockets) sendToAll(msg UpdateMessage) {
	s.Lock()
	defer s.Unlock()
	for _, value := range s.players {
		value.send(msg)
	}
}

func closeWithMessage(conn *websocket.Conn, msg string) {
	err := conn.WriteControl(websocket.CloseMessage,
		websocket.FormatCloseMessage(websocket.ClosePolicyViolation, msg), time.Now().Add(time.Second))
	if err != nil {
		return
	}
	conn.Close()
}
