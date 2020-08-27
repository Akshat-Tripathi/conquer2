package game

import "sync"

type globalChat struct {
	sync.RWMutex
	readyPlayers map[string]bool
	full         bool
}

func newGlobalChat() *globalChat {
	return &globalChat{
		readyPlayers: make(map[string]bool),
	}
}

func (gC *globalChat) add(player string) {
	gC.Lock()
	defer gC.Unlock()
	if gC.full {
		return
	}
	gC.readyPlayers[player] = true
}

func (gC *globalChat) rangeGlobalChat(f func(string)) {
	gC.RLock()
	defer gC.RUnlock()
	for p := range gC.readyPlayers {
		f(p)
	}
}
