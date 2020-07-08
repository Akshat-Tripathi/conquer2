package game

import (
	"sync"
	"time"
)

type countryState struct {
	Player string //Player that owns the country
	Troops int    //Troops in country
}

type playerState struct {
	sync.Mutex
	colour    string
	troops    int
	countries int
	password  string
}

func (p *playerState) incrementCountries() {
	p.Lock()
	defer p.Unlock()
	p.countries++
}

func (p *playerState) decrementCountries() {
	p.Lock()
	defer p.Unlock()
	p.countries--
}

func (p *playerState) getTroops() int {
	p.Lock()
	defer p.Unlock()
	return p.troops
}

func (p *playerState) addTroops(troops int) {
	p.Lock()
	defer p.Unlock()
	p.troops += troops
}

//Context - used to specify game parameters
type Context struct {
	ID                    string
	MaxPlayerNumber       int
	StartingTroopNumber   int
	StartingCountryNumber int
	TroopInterval         time.Duration
	Situation             map[string][]string
	Colours               []string
}

func sort(vals []int) []int {
	if len(vals) == 1 {
		return vals
	}
	if vals[0] < vals[1] {
		vals[0], vals[1] = vals[1], vals[0]
	}
	if len(vals) == 2 {
		return vals
	}
	if vals[2] > vals[1] {
		if vals[2] > vals[0] {
			return []int{vals[2], vals[0], vals[1]}
		}
		vals[1], vals[2] = vals[2], vals[1]
		return vals
	}
	return vals
}
