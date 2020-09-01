package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type leaderBoard struct {
	games map[string][3]string
}

type message struct {
	ID    string
	UTC   int64
	Items [3]string
}

func newLeaderBoard() *leaderBoard {
	return &leaderBoard{
		games: make(map[string][3]string),
	}
}

func (l *leaderBoard) push(id, name string) {
	board := l.games[id]
	board[2] = board[1]
	board[1] = board[0]
	board[0] = name
	l.games[id] = board
}

func (l *leaderBoard) flush(id string) {
	defer delete(l.games, id)
	msg, err := json.Marshal(message{
		ID:    id,
		UTC:   time.Now().Unix(),
		Items: l.games[id],
	})
	if err != nil {
		log.Println(err)
	}
	_, err = http.Post("url", "application/json", bytes.NewBuffer(msg))
	if err != nil {
		log.Println(err)
	}
}
