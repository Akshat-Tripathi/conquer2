package game

import "sync"

type lobby struct {
	sync.RWMutex
	readyPlayers map[string]bool
}

func newLobby() *lobby {
	return &lobby{
		readyPlayers: make(map[string]bool),
	}
}

func (l *lobby) add(player string) {
	l.Lock()
	defer l.Unlock()
	l.readyPlayers[player] = true
}

func (l *lobby) rangeLobby(f func(string)) {
	l.RLock()
	defer l.RUnlock()
	for p := range l.readyPlayers {
		f(p)
	}
}

func (l *lobby) length() int {
	l.RLock()
	defer l.RUnlock()
	return len(l.readyPlayers)
}
