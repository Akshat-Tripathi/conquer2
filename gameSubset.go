package main

import (
	"sync"

	"github.com/Akshat-Tripathi/conquer2/internal/game"
)

//This is used to store a queue of pointers to games -> should have all public games in one of these
type gameSubset struct {
	sync.RWMutex
	items map[string]*game.Game
}

func newGameSubset() *gameSubset {
	return &gameSubset{
		items: make(map[string]*game.Game),
	}
}

func (gs *gameSubset) add(id string, g *game.Game) {
	gs.Lock()
	defer gs.Unlock()
	gs.items[id] = g
}

func (gs *gameSubset) remove(id string) {
	gs.Lock()
	defer gs.Unlock()
	delete(gs.items, id)
}

func (gs *gameSubset) find(player, password string) string {
	gs.RLock()
	defer gs.RUnlock()
	for id, g := range gs.items {
		if (*g).AddReservation(player, password) {
			return id
		}
	}
	return "NOOP"
}
