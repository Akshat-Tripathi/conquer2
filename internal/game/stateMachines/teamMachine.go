package statemachines

import (
	"sync"
	"sync/atomic"
)

//TeamMachine allows players to team up, it is used for capital supremacy games
type TeamMachine struct {
	DefaultMachine
	capitalLock    sync.RWMutex
	capitals       map[string]string //Name : Capital
	allegianceLock sync.RWMutex
	allegiances    map[string]*playerAllegiance
	nIndependent   int32
}

var _ StateMachine = (*TeamMachine)(nil)

//Init initialises the DefaultMachine and overrides the validation functions
func (t *TeamMachine) Init(countries []string) {
	t.DefaultMachine.Init(countries)
	t.capitals = make(map[string]string)
	t.allegiances = make(map[string]*playerAllegiance)
	t.validateAttack = t.attackValid
	t.validateDeploy = t.deployValid
	t.validateMove = t.moveValid
}

//AddPlayer adds a player and creates a capital and allegiance for them
func (t *TeamMachine) AddPlayer(name, password, colour string, troops, countries int) int8 {
	status := t.DefaultMachine.AddPlayer(name, password, colour, troops, countries-1)
	if status == PlayerAdded {
		t.allegianceLock.Lock()
		defer t.allegianceLock.Unlock()
		t.allegiances[name] = &playerAllegiance{
			leader:    name,
			followers: make([]*playerAllegiance, 0),
		}
		//assign a capital
		t.capitalLock.Lock()
		defer t.capitalLock.Unlock()
		t.capitals[t.assignCountries(1, name)] = name
		atomic.AddInt32(&t.nIndependent, 1)
	}
	return status
}

func (t *TeamMachine) attackValid(src, dest *CountryState, player string, times int) bool {
	if t.attackDisabled && dest.Player != "" {
		if dest.Troops == 0 {
			//Prevents you from wiping the other player out entirely
			if func() bool {
				other := t.players[player]
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
	t.allegianceLock.RLock()
	defer t.allegianceLock.RUnlock()
	//Must own src
	if t.allegiances[src.Player].leader != t.allegiances[player].leader {
		return false
	}
	//Can't attack self
	if t.allegiances[src.Player].leader == t.allegiances[dest.Player].leader {
		return false
	}
	//Must have at least 1 troop to attack
	if src.Troops < 1 {
		return false
	}
	return true
}

func (t *TeamMachine) moveValid(src *CountryState, player string, troops int) bool {
	if t.moveDisabled {
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
	t.allegianceLock.RLock()
	defer t.allegianceLock.RUnlock()
	//Must own src
	if t.allegiances[src.Player].leader != t.allegiances[player].leader {
		return false
	}
	return true
}

func (t *TeamMachine) deployValid(src *PlayerState, dest *CountryState, player string, troops int) bool {
	if t.dropDisabled {
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
	t.allegianceLock.RLock()
	defer t.allegianceLock.RUnlock()
	//Must own src
	if t.allegiances[dest.Player].leader != t.allegiances[player].leader {
		return false
	}
	return true
}

//Attack performs an attack then checks for any change of allegiance
func (t *TeamMachine) Attack(src, dest, player string, times int) (valid, won, conquered bool, nSrc, nDest int) {
	valid, won, conquered, nSrc, nDest = t.DefaultMachine.Attack(src, dest, player, times)
	if conquered && t.isCapital(dest) {
		//change allegiances
		t.allegianceLock.Lock()
		defer t.allegianceLock.Unlock()
		destination := t.countries[dest]
		destination.Lock()
		defer destination.Unlock()
		t.allegiances[destination.Player].leader = t.allegiances[player].leader
		for _, follower := range t.allegiances[destination.Player].followers {
			follower.leader = t.allegiances[player].leader
		}
		//if the last country conquered isn't a capital
		// then the game should already be over as all capitals would have been taken
		won = atomic.AddInt32(&t.nIndependent, -1) == 1
	}
	return valid, won, conquered, nSrc, nDest
}

//RangeCapitals does what the name suggests
func (t *TeamMachine) RangeCapitals(f func(player, capital string)) {
	t.capitalLock.RLock()
	defer t.capitalLock.RUnlock()
	for player, capital := range t.capitals {
		f(player, capital)
	}
}

func (t *TeamMachine) isCapital(dest string) bool {
	t.capitalLock.RLock()
	defer t.capitalLock.RUnlock()
	for _, capital := range t.capitals {
		if capital == dest {
			return true
		}
	}
	return false
}
