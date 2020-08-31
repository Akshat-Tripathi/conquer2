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
type gameQueue struct {
	sync.RWMutex
	items []*game.Game
}

func (gq *gameQueue) push(g *game.Game) {
	gq.Lock()
	defer gq.Unlock()
	gq.items = append(gq.items, g)
}

func (gq *gameQueue) pop() *game.Game {
	gq.Lock()
	defer gq.Unlock()
	top := gq.items[0]
	gq.items = gq.items[1:]
	return top
}

func (gq *gameQueue) peek() *game.Game {
	gq.RLock()
	defer gq.RUnlock()
	return gq.items[0]
}
