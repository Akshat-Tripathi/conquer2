package game

import (
	"fmt"
	"math/rand"
	"sync"
)

type stateProcessor interface {
	processAction(Action) (bool, UpdateMessage, UpdateMessage)
	processTroops() []UpdateMessage
	checkPlayer(string, string) int8
	addPlayer(name, password, colour string)
	sendState(string, *connectionManager)
}

type defaultProcessor struct {
	sync.Mutex
	countries             []string
	situation             map[string][]string
	countryStates         map[string]*countryState //Maps countries to players / number of troops
	playerTroops          map[string]*playerState
	startingTroopNumber   int
	startingCountryNumber int
	maxPlayerNum          int
}

//PRE: Username is valid ie it is in playerTroops
//Sends initial state
func (p *defaultProcessor) sendState(username string, conn *connectionManager) {
	conn.sendToPlayer(UpdateMessage{
		Troops: p.playerTroops[username].getTroops(),
		Type:   "updateTroops",
		Player: username}, username)

	var msg UpdateMessage
	for country, state := range p.countryStates {
		//if state.troops > 0 || state.player != "" {
		msg = UpdateMessage{
			Troops:  state.Troops,
			Type:    "updateCountry",
			Player:  state.Player,
			Country: country}
		if state.Player == username && state.Troops == 0 {
			conn.sendToAll(msg)
		} else {
			conn.sendToPlayer(msg, username)
		}
		//}
	}
	for player, state := range p.playerTroops {
		conn.sendToAll(UpdateMessage{
			Type:    "newPlayer",
			Player:  player,
			Country: state.Colour,
		})
	}
}

//Calculates number of troops to send
func (p *defaultProcessor) processTroops() []UpdateMessage {
	p.Lock()
	defer p.Unlock()
	msgs := make([]UpdateMessage, len(p.playerTroops))
	i := 0
	deltaTroops := 0
	for name, vals := range p.playerTroops {
		func() {
			vals.Lock()
			defer vals.Unlock()
			deltaTroops = 3 + vals.Countries/3
			msgs[i] = UpdateMessage{Type: "updateTroops", Troops: deltaTroops, Player: name}
			vals.Troops += deltaTroops
			i++
		}()
	}
	return msgs
}

func (p *defaultProcessor) checkPlayer(name, password string) int8 {
	state, ok := p.playerTroops[name]
	if !ok {
		return 0
	}
	if state.Password == password {
		return 1
	}
	return 2
}

//PRE: the player name and password are unique
func (p *defaultProcessor) addPlayer(name, password, colour string) {
	p.Lock()
	defer p.Unlock()
	p.playerTroops[name] = &playerState{
		Troops:    p.startingTroopNumber,
		Countries: p.startingCountryNumber,
		Password:  password,
		Colour:    colour}
	country := ""
	//Assign countries
	//Can cause an error if there are no more countries
	for n := p.startingCountryNumber; n > 0; {
		country = p.countries[rand.Intn(len(p.countries))]
		if p.countryStates[country].Player != "" {
			continue
		}
		p.countryStates[country].Player = name
		n--
	}
}

func (p *defaultProcessor) processAction(action Action) (bool, UpdateMessage, UpdateMessage) {
	switch actionType := action.ActionType; actionType {
	case "attack":
		if p.validateAttack(action) {
			src := p.countryStates[action.Src]
			dest := p.countryStates[action.Dest]

			deltaSrc, deltaDest := 0, 0
			if dest.Troops != 0 {
				deltaSrc, deltaDest = defaultRng(src.Troops, dest.Troops)
			}

			src.Troops += deltaSrc
			dest.Troops += deltaDest

			if dest.Troops <= 0 && src.Troops > 0 {
				//Conquered the country
				dest.Troops++
				src.Troops--
				p.playerTroops[action.Player].incrementCountries()
				if dest.Player != "" {
					p.playerTroops[dest.Player].decrementCountries()
				}
				dest.Player = action.Player

				won := false
				if p.playerTroops[action.Player].Countries == len(p.countries) {
					won = true
					fmt.Println(action.Player + " won the game")
				}
				return won, UpdateMessage{Type: "updateCountry", Troops: 1, Player: action.Player, Country: action.Dest},
					UpdateMessage{Type: "updateCountry", Troops: -1 - deltaSrc, Player: action.Player, Country: action.Src}
			}
			return false, UpdateMessage{Type: "updateCountry", Troops: deltaDest, Player: p.countryStates[action.Dest].Player, Country: action.Dest},
				UpdateMessage{Type: "updateCountry", Troops: deltaSrc, Player: action.Player, Country: action.Src}
		}
	case "donate":
		if p.validateDonate(action) {
			p.playerTroops[action.Player].addTroops(-action.Troops)
			p.playerTroops[action.Dest].addTroops(action.Troops)
			return false, UpdateMessage{Type: "updateTroops", Troops: action.Troops, Player: action.Dest},
				UpdateMessage{Type: "updateTroops", Troops: -action.Troops, Player: action.Player}
		}
	case "drop":
		if p.validateDrop(action) {
			p.playerTroops[action.Player].addTroops(-action.Troops)
			p.countryStates[action.Dest].Troops += action.Troops
			return false, UpdateMessage{Type: "updateTroops", Troops: -action.Troops, Player: action.Player},
				UpdateMessage{Type: "updateCountry", Troops: action.Troops, Player: p.countryStates[action.Dest].Player, Country: action.Dest}
		}
	case "assist":
		if action.Player == p.countryStates[action.Dest].Player {
			break
		}
		fallthrough
	case "move":
		if action.ActionType == "move" {
			if action.Player != p.countryStates[action.Dest].Player {
				break
			}
		}
		if p.validateMove(action) {
			p.countryStates[action.Src].Troops -= action.Troops
			p.countryStates[action.Dest].Troops += action.Troops
			return false, UpdateMessage{Type: "updateCountry", Troops: -action.Troops, Player: action.Player, Country: action.Src},
				UpdateMessage{Type: "updateCountry", Troops: action.Troops, Player: p.countryStates[action.Dest].Player, Country: action.Dest}
		}
		/*
			case "removeUser":
				delete(p.playerTroops, action.Player)*/
	}
	return false, UpdateMessage{}, UpdateMessage{}
}

func (p *defaultProcessor) validateAttack(attack Action) bool {
	src, ok := p.countryStates[attack.Src]
	if !ok {
		return false
	}
	dest, ok := p.countryStates[attack.Dest]
	if !ok {
		return false
	}
	//Must select neighbouring countries
	if !p.areNeighbours(attack.Src, attack.Dest) {
		return false
	}
	//Must own src
	if src.Player != attack.Player {
		return false
	}
	//Can't attack self
	if src.Player == dest.Player {
		return false
	}
	//Must have at least 1 troop to attack
	if src.Troops < 1 {
		return false
	}
	return true
}

//PRE: donate.Dest is the name of the other player
func (p *defaultProcessor) validateDonate(donate Action) bool {
	me, ok := p.playerTroops[donate.Player]
	if !ok {
		return false
	}
	//troops must be > 0
	if donate.Troops < 0 {
		return false
	}
	//Must have troops
	if me.getTroops() < donate.Troops {
		return false
	}
	//Can't donate to self
	if donate.Dest == donate.Player {
		return false
	}
	_, ok = p.playerTroops[donate.Dest]
	return ok
}

func (p *defaultProcessor) validateMove(move Action) bool {
	src, ok := p.countryStates[move.Src]
	if !ok {
		return false
	}
	//Must select neighbouring countries
	if !p.areNeighbours(move.Src, move.Dest) {
		return false
	}
	//troops must be > 0
	if move.Troops < 0 {
		return false
	}
	//Must have troops
	if src.Troops < move.Troops {
		return false
	}
	if src.Player != move.Player {
		return false
	}
	_, ok = p.countryStates[move.Dest]
	return ok
}

func (p *defaultProcessor) validateDrop(drop Action) bool {
	me, ok := p.playerTroops[drop.Player]
	if !ok {
		return false
	}
	them, ok := p.countryStates[drop.Dest]
	if !ok {
		return false
	}
	//troops must be > 0
	if drop.Troops < 0 {
		return false
	}
	//Must have troops
	if me.getTroops() < drop.Troops {
		return false
	}
	//Must own dest
	if them.Player != drop.Player {
		return false
	}
	return true
}

//PRE: src and dest are valid strings
func (p *defaultProcessor) areNeighbours(src, dest string) bool {
	situation := p.situation[src]
	for _, v := range situation {
		if v == dest {
			return true
		}
	}
	return false
}

func sendState(username string, sp stateProcessor, conn *connectionManager) {
	sp.sendState(username, conn)
}
