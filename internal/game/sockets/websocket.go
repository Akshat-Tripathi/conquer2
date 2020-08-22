package sockets

import (
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/Akshat-Tripathi/conquer2/internal/game/common"
	"github.com/gorilla/websocket"
)

//Since every action from a websocket will only be used once it makes sense to
//process actions immediately after they are received

var (
	upgrader = websocket.Upgrader{}
)

type socket struct {
	responses chan common.UpdateMessage
	requests  chan common.Action
	close     chan struct{}
	conn      *websocket.Conn
}

func (s *socket) send(msg common.UpdateMessage) {
	go func() {
		s.responses <- msg
	}()
}

func (s *socket) read() {
	var action common.Action
	err := s.conn.ReadJSON(&action)
	if err != nil {
		log.Println(err)
		s.close <- struct{}{}
		return
	}
	s.requests <- action
}

//Sockets is a struct used to manage communication with users
type Sockets struct {
	sync.Mutex
	*FSM
	players map[string]*socket
	close   chan struct{}
}

//NewSockets creates a sockets struct
func NewSockets() *Sockets {
	return &Sockets{
		players: make(map[string]*socket),
		close:   make(chan struct{}),
	}
}

func (s *Sockets) NewPlayer(w http.ResponseWriter, r *http.Request, name string) *websocket.Conn {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return nil
	}
	s.players[name] = &socket{
		responses: make(chan common.UpdateMessage),
		requests:  make(chan common.Action),
		close:     make(chan struct{}),
		conn:      conn,
	}
	return conn
}

//PRE: name is in players
func (s *Sockets) Listen(name string) {
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
				return
			}
		case action := <-socket.requests:
			s.currentFunc(name, action)
		}
	}
}

//SendToPlayer sends an update message to a particular player
//PRE: msg is valid
func (s *Sockets) SendToPlayer(name string, msg common.UpdateMessage) {
	socket, ok := s.players[name]
	if !ok {
		return
	}
	socket.send(msg)
}

//SendToAll sends a message to all players
//PRE: msg is valid
func (s *Sockets) SendToAll(msg common.UpdateMessage) {
	s.Lock()
	defer s.Unlock()
	for _, value := range s.players {
		value.send(msg)
	}
}

//Close destroys all websockets
func (s *Sockets) Close() {
	s.close <- struct{}{}
}

//CloseWithMessage starts a closing handshake with the client
func CloseWithMessage(conn *websocket.Conn, msg string) {
	err := conn.WriteControl(websocket.CloseMessage,
		websocket.FormatCloseMessage(websocket.ClosePolicyViolation, msg), time.Now().Add(time.Second))
	if err != nil {
		return
	}
	conn.Close()
}
