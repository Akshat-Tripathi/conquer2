package game

import (
	"log"
	"math/rand"
)

type stateProcessor interface {
	processAction(Action) (bool, UpdateMessage, UpdateMessage)
	processTroops() []UpdateMessage
	checkPlayer(string, string) int8
	addPlayer(name, password, colour string)
	getState(string) []UpdateMessage
}

type defaultProcessor struct {
	countries             []string
	situation             map[string][]string
	countryStates         map[string]*countryState //Maps countries to players / number of troops
	playerTroops          map[string]*playerState
	startingTroopNumber   int
	startingCountryNumber int
	maxPlayerNum          int
}

//PRE: Username is valid ie it is in playerTroops
func (p *defaultProcessor) getState(username string) []UpdateMessage {
	msgs := make([]UpdateMessage, len(p.countries)+1+len(p.playerTroops))
	log.Println(len(p.playerTroops))
	//Sends initial state -- If you encounter sync issues, force all monitor goroutines to pause sending until this is done probably with a mutex
	i := 0
	msgs[i] = UpdateMessage{
		Troops: p.playerTroops[username].troops,
		Type:   "updateTroops",
		Player: username}
	i++

	for country, state := range p.countryStates {
		msgs[i] = UpdateMessage{
			Troops:  state.troops,
			Type:    "updateCountry",
			Player:  state.player,
			Country: country}
		i++
	}
	log.Println(p.playerTroops)
	for player, state := range p.playerTroops {
		msgs[i] = UpdateMessage{
			Type:    "newPlayer",
			Player:  player,
			Country: state.colour,
		}
		i++
	}
	return msgs
}

//Calculates number of troops to send
func (p *defaultProcessor) processTroops() []UpdateMessage {
	msgs := make([]UpdateMessage, len(p.playerTroops))
	i := 0
	deltaTroops := 0
	for name, vals := range p.playerTroops {
		deltaTroops = 3 + vals.countries/3
		msgs[i] = UpdateMessage{Type: "updateTroops", Troops: deltaTroops, Player: name}
		vals.troops += deltaTroops //Might lead to break
		i++
	}
	return msgs
}

func (p *defaultProcessor) checkPlayer(name, password string) int8 {
	state, ok := p.playerTroops[name]
	if !ok {
		return 0
	}
	if state.password == password {
		return 1
	}
	return 2
}

//PRE: the player name and password are unique
func (p *defaultProcessor) addPlayer(name, password, colour string) {
	p.playerTroops[name] = &playerState{
		troops:    p.startingTroopNumber,
		countries: p.startingCountryNumber,
		password:  password,
		colour:    colour}
	country := ""
	//Assign countries
	for n := p.startingCountryNumber; n > 0; {
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
				if p.playerTroops[action.Player].countries == len(p.countries) {
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
			return false, UpdateMessage{Type: "updateCountry", Troops: -action.Troops, Player: action.Player, Country: action.Src},
				UpdateMessage{Type: "updateCountry", Troops: action.Troops, Country: action.Dest}
		}
	case "drop":
		if p.validateDrop(action) {
			p.playerTroops[action.Player].troops -= action.Troops
			p.countryStates[action.Dest].troops += action.Troops
			return false, UpdateMessage{Type: "updateTroops", Troops: -action.Troops, Player: action.Player},
				UpdateMessage{Type: "updateCountry", Troops: action.Troops, Country: action.Dest}
		}
		/*
			case "removeUser":
				delete(p.playerTroops, action.Player)*/
	}
	return false, UpdateMessage{}, UpdateMessage{}
}

func (p defaultProcessor) validateAttack(attack Action) bool {
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
	if src.player != attack.Player {
		return false
	}
	//Mustn't own dest
	if dest.player == attack.Player {
		return false
	}
	//Can't attack self
	if src.player == dest.player {
		return false
	}
	//Must have at least 1 troop to attack
	if src.troops < 1 {
		return false
	}
	return true
}

func (p defaultProcessor) validateDonate(donate Action) bool {
	me, ok := p.playerTroops[donate.Player]
	if !ok {
		return false
	}
	them, ok := p.countryStates[donate.Dest]
	if !ok {
		return false
	}
	//Must have troops
	if me.troops < donate.Troops {
		return false
	}
	//Can't donate to self
	if them.player == donate.Player {
		return false
	}
	return true
}

func (p defaultProcessor) validateMove(move Action) bool {
	src, ok := p.countryStates[move.Src]
	if !ok {
		return false
	}
	//Must select neighbouring countries
	if !p.areNeighbours(move.Src, move.Dest) {
		return false
	}
	//Must have troops
	if src.troops < move.Troops {
		return false
	}
	if src.player != move.Player {
		return false
	}
	//Must own dest
	/*if dest.player == move.Player {
		return false
	}*/
	_, ok = p.countryStates[move.Dest]
	return ok
}

func (p defaultProcessor) validateDrop(drop Action) bool {
	me, ok := p.playerTroops[drop.Player]
	if !ok {
		return false
	}
	them, ok := p.countryStates[drop.Dest]
	if !ok {
		return false
	}
	//Must select neighbouring countries
	if !p.areNeighbours(drop.Src, drop.Dest) {
		return false
	}
	//Must have troops
	if me.troops < drop.Troops {
		return false
	}
	//Can't donate to nil
	if them.player != "" {
		return false
	}
	return true
}

//PRE: src and dest are valid strings
func (p defaultProcessor) areNeighbours(src, dest string) bool {
	situation := p.situation[src]
	for _, v := range situation {
		if v == dest {
			return true
		}
	}
	return false
}
