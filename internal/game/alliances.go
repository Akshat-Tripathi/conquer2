package game

import (
	"sync"
	"time"

	"github.com/Akshat-Tripathi/conquer2/internal/game/common"
	"github.com/Akshat-Tripathi/conquer2/internal/game/sockets"
	stateprocessors "github.com/Akshat-Tripathi/conquer2/internal/game/stateProcessors"
)

type alliances struct {
	sync.RWMutex
	comms     *sockets.Sockets
	processor stateprocessors.StateProcessor
	alliances map[string]struct {
		cost  int
		timer *time.Timer
	} // key: player1,player2   value: troops in alliance
}

func newAlliances(comms *sockets.Sockets, processor stateprocessors.StateProcessor) *alliances {
	return &alliances{
		RWMutex: sync.RWMutex{},
		alliances: make(map[string]struct {
			cost  int
			timer *time.Timer
		}),
		comms:     comms,
		processor: processor,
	}
}

func makeKey(player1, player2 string) string {
	if player1 > player2 {
		return player2 + "," + player1
	}
	return player1 + "," + player2
}

func (a *alliances) addAlliance(player1, player2 string, cost int) {
	a.Lock()
	defer a.Unlock()
	key := makeKey(player1, player2)
	if alliance, ok := a.alliances[key]; ok {
		cost += alliance.cost
		alliance.timer.Stop()
	}
	a.alliances[key] = struct {
		cost  int
		timer *time.Timer
	}{
		cost: cost,
		timer: time.AfterFunc(time.Duration(cost)*5*time.Second, func() {
			a.breakAlliance(player1, player2, true)
		}),
	}
	a.processor.AddTroops(player1, -cost)
	a.processor.AddTroops(player2, -cost)
	a.comms.SendToPlayer(player1, common.UpdateMessage{
		Type:   "ally",
		Troops: cost,
		Player: player2,
		ID:     ally,
	})
	a.comms.SendToPlayer(player2, common.UpdateMessage{
		Type:   "ally",
		Troops: cost,
		Player: player1,
		ID:     ally,
	})
}

func (a *alliances) areAllied(player1, player2 string) bool {
	a.RLock()
	defer a.RUnlock()
	_, ok := a.alliances[makeKey(player1, player2)]
	return ok
}

// If the alliance expired then both players get their initial investments back
// otherwise player1's investment goes to player2
func (a *alliances) breakAlliance(player1, player2 string, expired bool) {
	a.Lock()
	defer a.Unlock()
	key := makeKey(player1, player2)
	if alliance, ok := a.alliances[key]; ok {
		cost1 := alliance.cost
		cost2 := alliance.cost
		if expired {
			alliance.timer.Stop()
		} else {
			cost2 *= 2
			cost1 = 0
		}

		a.processor.AddTroops(player1, cost1)
		a.processor.AddTroops(player2, cost2)

		delete(a.alliances, makeKey(player1, player2))
		a.comms.SendToPlayer(player1, common.UpdateMessage{
			Type:   "break",
			Troops: cost1,
			Player: player2,
			ID:     breakAlliance,
		})
		a.comms.SendToPlayer(player2, common.UpdateMessage{
			Type:   "break",
			Troops: cost2,
			Player: player1,
			ID:     breakAlliance,
		})
	}
}
