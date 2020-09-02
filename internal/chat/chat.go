package chat

import (
	"log"
	"net/http"
	"sync"

	"github.com/Akshat-Tripathi/conquer2/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

//Since every action from a websocket will only be used once it makes sense to
//process actions immediately after they are received

type msgIn string

type msgOut struct {
	Name string
	Text msgIn
}

type member struct {
	responses chan msgOut
	requests  chan msgIn
	close     chan struct{}
	conn      *websocket.Conn
}

func (m *member) send(msg msgOut) {
	go func() {
		m.responses <- msg
	}()
}

func (m *member) read() {
	// err := m.conn.ReadJSON(&msg)
	_, msg, err := m.conn.ReadMessage()
	log.Println(string(msg))
	if err != nil {
		log.Println(err)
		m.close <- struct{}{}
		return
	}
	//Filter out the "keepAlive" messages
	if string(msg) != "" {
		m.requests <- msgIn(msg)
	}
}

//Room is a struct used to manage communication with users
type Room struct {
	sync.Mutex
	members map[string]*member
	close   chan struct{}
}

//NewRoom creates a new chat room
func NewRoom() *Room {
	return &Room{
		members: make(map[string]*member),
		close:   make(chan struct{}),
	}
}

//newMember connects a member to the room
func (r *Room) newMember(w http.ResponseWriter, req *http.Request, name string) *member {
	conn, err := config.Upgrader.Upgrade(w, req, nil)
	if err != nil {
		log.Println(err)
		return nil
	}
	m := &member{
		responses: make(chan msgOut, 10),
		requests:  make(chan msgIn),
		close:     make(chan struct{}),
		conn:      conn,
	}
	r.members[name] = m
	return m
}

//Handle handles an incomming connection
func (r *Room) Handle(ctx *gin.Context) {
	username, err := ctx.Cookie("username")
	if err != nil {
		return
	}
	m := r.newMember(ctx.Writer, ctx.Request, username)
	if m != nil {
		r.listen(username, m)
	}
}

//listen manages the connection of 1 member
//PRE: name is in members
func (r *Room) listen(name string, m *member) {
	defer m.conn.Close()
	defer delete(r.members, name)
	go func() {
		for {
			m.read()
		}
	}()
	for {
		select {
		case <-r.close:
			return
		case <-m.close:
			return
		case msg := <-m.responses:
			err := m.conn.WriteJSON(msg)
			if err != nil {
				log.Println(err)
				return
			}
		case msg := <-m.requests:
			r.sendToAll(msgOut{
				Name: name,
				Text: msg,
			})
		}
	}
}

func (r *Room) sendToAll(msg msgOut) {
	r.Lock()
	defer r.Unlock()
	for _, m := range r.members {
		m.send(msg)
	}
}

//Close destroys all websockets
func (r *Room) Close() {
	r.close <- struct{}{}
}
