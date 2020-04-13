package game

import (
	"net/http"
	"sync/atomic"
)

//NormalGame - basic test version
type NormalGame struct {
	id                  string
	countryStates       map[string]*countryState //Maps countries to players / number of troops
	playerTroops        map[string]*int
	conn                connectionManager
	numPlayers          int32
	maxPlayerNum        int32
	startingTroopNumber int
	actions             chan Action
}

//Handle - a handles all new players
func (ng *NormalGame) Handle(w http.ResponseWriter, r *http.Request) {
	if ng.numPlayers < ng.maxPlayerNum {
		atomic.AddInt32(&ng.numPlayers, 1)
		http.Redirect(w, r, "/gamefull", http.StatusFound)
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic(err)
	}
	cookie, err := r.Cookie("username")
	if err != nil {
		panic(err)
	}
	name := cookie.Value
	_, ok := ng.playerTroops[name]
	for ok {
		name = generateFakeName(name)
		_, ok = ng.playerTroops[name]
	}
	ng.playerTroops[name] = &ng.startingTroopNumber
	ng.conn.Monitor(name, conn, ng.actions)
}

func (ng *NormalGame) processActions() {
	for act := range ng.actions {
		switch action := act.(type) {
		case Attack:
			if ng.validateAttack(action) {
				//Attack code
			}
		case Donate:
			if ng.validateDonate(action) {
				*ng.playerTroops[action.Player] -= action.Troops //Might cause error
				*ng.playerTroops[ng.countryStates[action.Dest].player] += action.Troops
			}
		case Move:
			if ng.validateMove(action) {
				ng.countryStates[action.Src].troops -= action.Troops
				ng.countryStates[action.Dest].troops += action.Troops
			}
		case Drop:
			if ng.validateDrop(action) {
				ng.countryStates[action.Src].troops -= action.Troops
				ng.countryStates[action.Dest].troops += action.Troops
			}
		}
	}
}

func (ng NormalGame) validateAttack(attack Attack) bool {
	src := ng.countryStates[attack.Src]
	destPlayer := ng.countryStates[attack.Dest].player
	//Must own src
	if src.player != attack.Player {
		return false
	}
	//Mustn't own dest
	if destPlayer == attack.Player {
		return false
	}
	//Can't attack self
	if src.player == destPlayer {
		return false
	}
	//Must have 2+ troops to attack
	if src.troops < 2 {
		return false
	}
	return true
}

func (ng NormalGame) validateDonate(donate Donate) bool {
	//Must have troops
	if *ng.playerTroops[donate.Player] < donate.Troops {
		return false
	}
	//Can't donate to self
	if ng.countryStates[donate.Dest].player == donate.Player {
		return false
	}
	return true
}

func (ng NormalGame) validateMove(move Move) bool {
	src := ng.countryStates[move.Src]
	//Must have troops
	if src.troops < move.Troops {
		return false
	}
	if src.player != move.Player {
		return false
	}
	//Must own dest
	if ng.countryStates[move.Dest].player == move.Player {
		return false
	}
	return true
}

func (ng NormalGame) validateDrop(drop Drop) bool {
	//Must have troops
	if *ng.playerTroops[drop.Player] < drop.Troops {
		return false
	}
	//Can't donate to self
	if ng.countryStates[drop.Dest].player == drop.Player {
		return false
	}
	return true
}
