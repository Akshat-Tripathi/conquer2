package game

import "math/rand"

type stateProcessor interface {
	processAction(Action) (bool, UpdateMessage, UpdateMessage)
	processTroops()
	addPlayer(string, string)
	checkPlayer(string, string) bool
}

type defaultProcessor struct {
	countries             []string
	neighbours            *map[string][]string
	countryStates         map[string]*countryState //Maps countries to players / number of troops
	playerTroops          map[string]*playerState
	startingTroopNumber   int
	startingCountryNumber int
}

func (p *defaultProcessor) checkPlayer(name, password string) bool {
	state, ok := p.playerTroops[name]
	if !ok {
		return false
	}
	return state.password == password
}

//PRE: the player name and password are unique
func (p *defaultProcessor) addPlayer(name string, password string) {
	p.playerTroops[name] = &playerState{troops: p.startingTroopNumber,
		countries: p.startingCountryNumber,
		password:  password} //TODO colour decision
	country := ""
	//Assign countries
	for n := p.startingTroopNumber; n > 0; {
		country = p.countries[rand.Intn(len(p.countries))]
		if p.countryStates[country].player != "" {
			continue
		}
		p.countryStates[country].player = name
		n--
	}
}

func (p *defaultProcessor) processAction(action Action) (bool, UpdateMessage, UpdateMessage) {
	switch actionType := action.ActionType; actionType {
	case "attack":
		if p.validateAttack(action) {
			src := p.countryStates[action.Src]
			dest := p.countryStates[action.Dest]
			deltaSrc, deltaDest := defaultRng(src.troops, dest.troops)

			src.troops -= deltaSrc
			dest.troops -= deltaDest

			if dest.troops == 0 && src.troops > 0 {
				dest.player = action.Player
				dest.troops++
				src.troops--
				p.playerTroops[action.Player].countries++
				p.playerTroops[dest.player].countries--

				won := false
				if p.playerTroops[action.Player].countries == maxCountries {
					won = true
				}
				return won, UpdateMessage{Type: "updateCountry", Player: action.Player, Country: action.Dest},
					UpdateMessage{Type: "updateCountry", Troops: -1 - deltaSrc, Country: action.Src}
			}
			return false, UpdateMessage{Type: "updateCountry", Troops: -deltaDest, Country: action.Dest},
				UpdateMessage{Type: "updateCountry", Troops: -deltaSrc, Country: action.Src}
		}
	case "donate":
		if p.validateDonate(action) {
			recv := p.countryStates[action.Dest].player
			p.playerTroops[action.Player].troops -= action.Troops //Might cause error
			p.playerTroops[recv].troops += action.Troops
			return false, UpdateMessage{Type: "updateTroops", Troops: action.Troops, Player: recv},
				UpdateMessage{Type: "updateTroops", Troops: -action.Troops, Player: action.Player}
		}
	case "move":
		if p.validateMove(action) {
			p.countryStates[action.Src].troops -= action.Troops
			p.countryStates[action.Dest].troops += action.Troops
			return false, UpdateMessage{Type: "updateTroops", Troops: -action.Troops, Player: action.Player},
				UpdateMessage{Type: "updateCountry", Troops: action.Troops, Country: action.Src}
		}
	case "drop":
		if p.validateDrop(action) {
			p.playerTroops[action.Player].troops -= action.Troops
			p.countryStates[action.Dest].troops += action.Troops
			return false, UpdateMessage{Type: "updateTroops", Troops: -action.Troops, Player: action.Player},
				UpdateMessage{Type: "updateCountry", Troops: action.Troops, Country: action.Dest}
		}
	case "removeUser":
		delete(p.playerTroops, action.Player)
	}
	return false, UpdateMessage{}, UpdateMessage{}
}

func (p defaultProcessor) validateAttack(attack Action) bool {
	src := p.countryStates[attack.Src]
	destPlayer := p.countryStates[attack.Dest].player
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
	//Must have at least 1 troop to attack
	if src.troops < 1 {
		return false
	}
	return true
}

func (p defaultProcessor) validateDonate(donate Action) bool {
	//Must have troops
	if p.playerTroops[donate.Player].troops < donate.Troops {
		return false
	}
	//Can't donate to self
	if p.countryStates[donate.Dest].player == donate.Player {
		return false
	}
	return true
}

func (p defaultProcessor) validateMove(move Action) bool {
	src := p.countryStates[move.Src]
	//Must have troops
	if src.troops < move.Troops {
		return false
	}
	if src.player != move.Player {
		return false
	}
	//Must own dest
	if p.countryStates[move.Dest].player == move.Player {
		return false
	}
	return true
}

func (p defaultProcessor) validateDrop(drop Action) bool {
	//Must have troops
	if p.playerTroops[drop.Player].troops < drop.Troops {
		return false
	}
	//Can't donate to nil
	if p.countryStates[drop.Dest].player != "" {
		return false
	}
	return true
}
