package chat

import (
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/Akshat-Tripathi/conquer2/internal/game/common"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

//Since every action from a websocket will only be used once it makes sense to
//process actions immediately after they are received

var upgrader = websocket.Upgrader{}

type msgIn = string

type msgOut struct {
	name string
	text string
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
	var msg msgIn
	err := m.conn.ReadJSON(&msg)
	if err != nil {
		log.Println(err)
		m.close <- struct{}{}
		return
	}
	//Filter out the "keepAlive" messages
	if msg != "" {
		m.requests <- action
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
func (r *Room) newMember(w http.ResponseWriter, r *http.Request, name string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	r.members[name] = &member{
		responses: make(chan msgOut, 10),
		requests:  make(chan msgIn),
		close:     make(chan struct{}),
		conn:      conn,
	}
}

//Handle handles an incomming connection
func (r *Room) Handle(ctx *gin.Context) {
	username, err := ctx.Cookie("username")
	if err != nil {
		return
	}
	m := newMember(ctx.Writer, ctx.Request, username)
	r.listen(m)
}

//listen manages the connection of 1 member
//PRE: name is in members
func (r *Room) listen(m *member) {
	defer member.conn.Close()
	defer delete(r.members, name)
	go func() {
		for {
			member.read()
		}
	}()
	for {
		select {
		case <-r.close:
			return
		case <-member.close:
			return
		case msg := <-member.responses:
			err := member.conn.WriteJSON(msg)
			if err != nil {
				log.Println(err)
				return
			}
		case msg := <-member.requests:
			r.sendToAll(msgOut{
				name: name,
				text: msg,
			})
		}
	}
}

func (r *Room) sendToAll(msg msgOut) {
	r.Lock()
	defer r.Unlock()
	for _, member := range r.members {
		member.send(msg)
	}
}

//Close destroys all websockets
func (r *Room) Close() {
	r.close <- struct{}{}
}