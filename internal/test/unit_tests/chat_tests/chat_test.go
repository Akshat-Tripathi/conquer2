package chat_test

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"testing"

	"github.com/Akshat-Tripathi/conquer2/internal/chat"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/assert/v2"
	"github.com/gorilla/websocket"
)

type msgOut struct {
	Name string
	Text string
}

func init() {
	gin.SetMode(gin.ReleaseMode)
	go func() {
		r := chat.NewRoom()
		http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
			c, _ := gin.CreateTestContext(w)
			c.Request = req
			r.Handle(c)
		})
		log.Fatalln(http.ListenAndServe(":8080", nil))
	}()
}

func addMember(name string, onmessage func(msgOut)) (*websocket.Conn, error) {
	dialer := websocket.Dialer{}
	req, err := http.NewRequest("GET", "ws://localhost:8080", nil)
	if err != nil {
		return nil, err
	}
	req.AddCookie(&http.Cookie{Name: "username", Value: name})
	conn, _, err := dialer.Dial("ws://localhost:8080/", req.Header)
	if err != nil {
		return nil, err
	}
	go func() {
		var msg msgOut
		for {
			err := conn.ReadJSON(&msg)
			if err != nil {
				log.Println(err)
				return
			}
			onmessage(msg)
		}
	}()
	return conn, nil
}

func TestAddingMembers(t *testing.T) {
	for i := 0; i < 20; i++ {
		_, err := addMember(fmt.Sprintf("member %d", i), func(m msgOut) {})
		assert.Equal(t, err, nil)
	}
}

func TestSendMessage(t *testing.T) {
	var wg sync.WaitGroup
	wg.Add(1)
	m, err := addMember("Akshat", func(msg msgOut) {
		wg.Done()
		assert.Equal(t, msg.Text, "hello")
		assert.Equal(t, msg.Name, "Akshat")
	})
	if err != nil {
		t.Fail()
	}
	m.WriteJSON("hello")
	wg.Wait()
}

func TestMessagesSentToAll(t *testing.T) {
	var wg sync.WaitGroup
	for i := 0; i < 19; i++ {
		wg.Add(1)
		_, err := addMember(fmt.Sprint(i), func(m msgOut) {
			wg.Done()
			assert.Equal(t, m.Text, "hello")
			assert.Equal(t, m.Name, "Akshat")
		})
		if err != nil {
			t.Fail()
		}
	}
	m, err := addMember("Akshat", func(m msgOut) {
		assert.Equal(t, m.Text, "hello")
		assert.Equal(t, m.Name, "Akshat")
	})
	if err != nil {
		t.Fail()
	}
	m.WriteJSON("hello")
	wg.Wait()
}
