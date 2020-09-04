package game

import "sync"

type lobby struct {
	sync.RWMutex
	reservedPlayers map[string]string
	readyPlayers    map[string]struct{}
	full            bool
}

func newLobby() *lobby {
	return &lobby{
		reservedPlayers: make(map[string]string),
		readyPlayers:    make(map[string]struct{}),
	}
}

func (l *lobby) addReservation(player, password string) bool {
	l.Lock()
	defer l.Unlock()
	if _, ok := l.reservedPlayers[player]; ok || l.full {
		return false
	}
	l.reservedPlayers[player] = password
	return true
}

func (l *lobby) add(player string) {
	l.Lock()
	defer l.Unlock()
	if l.full {
		return
	}
	if _, ok := l.reservedPlayers[player]; ok {
		delete(l.reservedPlayers, player)
	}
	l.readyPlayers[player] = struct{}{}
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
