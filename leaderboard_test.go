package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"testing"

	"github.com/go-playground/assert/v2"
)

func initLeaderBoard() *leaderBoard {
	l := newLeaderBoard()

	for i := 0; i < 10; i++ {
		for j := 0; j < 10; j++ {
			l.push(fmt.Sprint(i), fmt.Sprint(j))
		}
	}
	return l
}

func TestPush(t *testing.T) {
	l := initLeaderBoard()

	for i := 0; i < 10; i++ {
		board := l.games[fmt.Sprint(i)]
		for j := 0; j < 3; j++ {
			assert.Equal(t, board[j], fmt.Sprint(9-j))
		}
	}
}

func TestFlush(t *testing.T) {
	l := initLeaderBoard()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		decoder := json.NewDecoder(r.Body)
		var msg message

		err := decoder.Decode(&msg)
		if err != nil {
			log.Fatalln("Invalid input")
		}

		assert.Equal(t, msg.Items, [3]string{"9", "8", "7"})
	})

	go http.ListenAndServe(":8080", nil)

	for i := 0; i < 10; i++ {
		l.flush("http://localhost:8080", fmt.Sprint(i))
	}
}
