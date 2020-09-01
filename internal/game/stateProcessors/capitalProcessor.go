package stateprocessors

import (
	"sync"
	"sync/atomic"
)

//capitalTroops is the number of troops each capital starts with
const capitalTroops = 20

//CapitalProcessor allows players to team up, it is used for capital supremacy games
type CapitalProcessor struct {
	DefaultProcessor
	capitalLock    sync.RWMutex
	capitals       map[string]string //Name : Capital
	allegianceLock sync.RWMutex
	allegiances    map[string]*playerAllegiance
	nIndependent   int32
}

var _ StateProcessor = (*CapitalProcessor)(nil)

//NewCapitalProcessor creates a new CapitalProcessor from an existing DefaultProcessor
func NewCapitalProcessor(d DefaultProcessor) *CapitalProcessor {
	cp := &CapitalProcessor{DefaultProcessor: d}

	cp.capitals = make(map[string]string)
	cp.allegiances = make(map[string]*playerAllegiance)
	cp.validateAttack = cp.attackValid
	cp.validateDeploy = cp.deployValid
	cp.validateMove = cp.moveValid

	return cp
}

//AddPlayer adds a player and creates a capital and allegiance for them
func (cp *CapitalProcessor) AddPlayer(name, password, colour string, troops, countries int) int8 {
	status := cp.DefaultProcessor.AddPlayer(name, password, colour, troops, countries-1)
	if status == PlayerAdded {
		cp.allegianceLock.Lock()
		defer cp.allegianceLock.Unlock()
		cp.allegiances[name] = &playerAllegiance{
			leader:    name,
			followers: make([]*playerAllegiance, 0),
		}
		//assign a capital
		cp.capitalLock.Lock()
		defer cp.capitalLock.Unlock()
		capital := cp.assignCountries(1, name)
		cp.capitals[name] = capital

		c := cp.countries[capital]
		c.Lock()
		defer c.Unlock()
		c.Troops = capitalTroops

		atomic.AddInt32(&cp.nIndependent, 1)
	}
	return status
}

func (cp *CapitalProcessor) attackValid(src, dest *CountryState, player string, times int) bool {
	if cp.attackDisabled && dest.Player != "" {
		if dest.Troops == 0 {
			//Prevents you from wiping the other player out entirely
			if func() bool {
				other := cp.players[player]
				other.Lock()
				defer other.Unlock()

				return other.Countries == 1
			}() {
				return false
			}
		} else {
			return false
		}
	}
	if times <= 0 {
		return false
	}
	cp.allegianceLock.RLock()
	defer cp.allegianceLock.RUnlock()
	//Must own src
	if cp.allegiances[src.Player].leader != cp.allegiances[player].leader {
		return false
	}
	//Can't attack self
	if dest.Player != "" && cp.allegiances[src.Player].leader == cp.allegiances[dest.Player].leader {
		return false
	}
	//Must have at least 1 troop to attack
	if src.Troops < 1 {
		return false
	}
	return true
}

func (cp *CapitalProcessor) moveValid(src *CountryState, player string, troops int) bool {
	if cp.moveDisabled {
		return false
	}
	//troops must be > 0
	if troops < 0 {
		return false
	}
	//Must have troops
	if src.Troops < troops && src.Troops > 0 {
		return false
	}
	cp.allegianceLock.RLock()
	defer cp.allegianceLock.RUnlock()
	//Must own src
	if cp.allegiances[src.Player].leader != cp.allegiances[player].leader {
		return false
	}
	return true
}

func (cp *CapitalProcessor) deployValid(src *PlayerState, dest *CountryState, player string, troops int) bool {
	if cp.dropDisabled {
		return false
	}
	//troops must be > 0
	if troops < 0 {
		return false
	}
	//Must have troops
	if src.Troops < troops {
		return false
	}
	cp.allegianceLock.RLock()
	defer cp.allegianceLock.RUnlock()
	//Must own src
	if cp.allegiances[dest.Player].leader != cp.allegiances[player].leader {
		return false
	}
	return true
}

//Attack performs an attack then checks for any change of allegiance
func (cp *CapitalProcessor) Attack(src, dest, player string, times int) (valid, won, conquered bool, nSrc, nDest int, playerLost string) {
	oldPlayer := func() string {
		destination := cp.countries[dest]
		destination.Lock()
		defer destination.Unlock()
		return destination.Player
	}()
	valid, won, conquered, nSrc, nDest, _ = cp.DefaultProcessor.Attack(src, dest, player, times)
	if conquered && cp.isCapital(dest) {
		//change allegiances
		cp.allegianceLock.Lock()
		defer cp.allegianceLock.Unlock()
		cp.allegiances[oldPlayer].leader = cp.allegiances[player].leader
		for _, follower := range cp.allegiances[oldPlayer].followers {
			follower.leader = cp.allegiances[player].leader
		}
		//if the last country conquered isn't a capital
		// then the game should already be over as all capitals would have been taken
		won = atomic.AddInt32(&cp.nIndependent, -1) == 1
	}
	return valid, won, conquered, nSrc, nDest, ""
}

//RangeCapitals does what the name suggests
func (cp *CapitalProcessor) RangeCapitals(f func(player, capital string)) {
	cp.capitalLock.RLock()
	defer cp.capitalLock.RUnlock()
	for player, capital := range cp.capitals {
		f(player, capital)
	}
}

func (cp *CapitalProcessor) isCapital(dest string) bool {
	cp.capitalLock.RLock()
	defer cp.capitalLock.RUnlock()
	for _, capital := range cp.capitals {
		if capital == dest {
			return true
		}
	}
	return false
}
