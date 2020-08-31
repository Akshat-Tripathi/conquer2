package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
	"sync"
	"time"

	"github.com/Akshat-Tripathi/conquer2/internal/game"
)

func loadColours() []string {
	file, err := os.Open("./colours.txt")
	if err != nil {
		panic(err)
	}
	scanner := bufio.NewScanner(file)
	scanner.Split(bufio.ScanLines)

	cols := make([]string, 20)
	i := 0
	for scanner.Scan() {
		cols[i] = scanner.Text()
		i++
	}
	return cols
}

func genID() string {
	return fmt.Sprintf("%06x", rand.Intn(10000))
}

func shuffle(strs []string) []string {
	rand.Seed(time.Now().UnixNano())
	shuffled := make([]string, len(strs))
	for i, j := range rand.Perm(len(strs)) {
		shuffled[i] = strs[j]
	}
	return shuffled
}

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
