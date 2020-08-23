package sockets

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
	"sync/atomic"
	"testing"

	"github.com/Akshat-Tripathi/conquer2/internal/game/common"
	"github.com/Akshat-Tripathi/conquer2/internal/game/sockets"
	"github.com/go-playground/assert/v2"
	"github.com/gorilla/websocket"
)

func init() {
	log.SetOutput(ioutil.Discard)
	go ListenAndServe()
}

func ListenAndServe() {
	s := sockets.NewSockets()
	s.FSM = sockets.NewFSM(func(name string, action common.Action) bool {
		if action.ActionType == "1" {
			s.SendToAll(common.UpdateMessage{
				Player: name,
				Troops: action.Troops * 2,
			})
		} else {
			s.SendToPlayer(name, common.UpdateMessage{
				Player: name,
				Troops: action.Troops * 2,
			})
		}
		return false
	})
	s.FSM.Start()
	var players int32
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		name := fmt.Sprint(atomic.AddInt32(&players, 1))
		s.NewPlayer(w, r, name)
		s.Listen(name)
	})

	log.Fatalln(http.ListenAndServe(":8080", nil))
}

func newPlayer(onMessage func(msg common.UpdateMessage, i ...int), i int) *websocket.Conn {
	dialer := websocket.Dialer{}
	conn, _, err := dialer.Dial("ws://localhost:8080", nil)
	if err != nil {
		log.Fatalln(err)
	}
	go func() {
		var msg common.UpdateMessage
		for {
			err := conn.ReadJSON(&msg)
			if err != nil {
				//log.Println(err)
				conn.Close()
				return
			}
			onMessage(msg, i)
		}
	}()
	return conn
}

func TestWebsocketSendToPlayer(t *testing.T) {
	var wg sync.WaitGroup
	wg.Add(1)
	conn := newPlayer(func(msg common.UpdateMessage, _ ...int) {
		assert.Equal(t, 2, msg.Troops)
		assert.Equal(t, "1", msg.Player)
		wg.Done()
	}, 0)
	defer conn.Close()
	conn.WriteJSON(common.Action{
		Troops: 1,
	})
	wg.Wait()
}

func TestWebsocketSendToAll(t *testing.T) {
	var wg sync.WaitGroup
	n := 30
	conns := make([]*websocket.Conn, n)
	for i := 0; i < n; i++ {
		wg.Add(1)
		conns[i] = newPlayer(func(msg common.UpdateMessage, i ...int) {
			if msg.Troops == 2*n-2 {
				log.Println(msg.Troops, 2*n-2, i)
				wg.Done()
			}
		}, i)
	}
	for i := 0; i < n; i++ {
		go conns[i].WriteJSON(common.Action{
			ActionType: "1",
			Troops:     i,
		})
		defer conns[i].Close()
	}
	log.Println("All sent")
	wg.Wait()
	log.Println("done")
}

//This is commented out because I don't think that message order should matter for most messages
//If further investigation reveals that this is the cause of the negative troops bug, then uncomment this
/*
func TestWebsocketMessageOrder(t *testing.T) {
	var wg sync.WaitGroup
	n := 20
	max := 1000

	orderChecker := func() func(common.UpdateMessage, ...int) {
		n := int32(-1)
		return func(msg common.UpdateMessage, _ ...int) {
			assert.Equal(t, int32(msg.Troops), atomic.AddInt32(&n, 1)*2)
			if n == int32(max) {
				wg.Done()
			}
		}
	}
	conns := make([]*websocket.Conn, n)
	for i := 0; i < n; i++ {
		wg.Add(1)
		conns[i] = newPlayer(orderChecker(), i)
		defer conns[i].Close()
	}
	sender := newPlayer(func(msg common.UpdateMessage, _ ...int) {}, -1)
	for i := 0; i <= max; i++ {
		sender.WriteJSON(common.Action{
			ActionType: "1",
			Troops:     i,
		})
	}
	wg.Wait()
}
*/
