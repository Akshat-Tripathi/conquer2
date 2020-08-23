package stateprocessors

import "sync"

//CountryState represents a country
type CountryState struct {
	sync.RWMutex
	Player string //Player that owns the country
	Troops int    //Troops in country
}

//PlayerState represents a player
type PlayerState struct {
	sync.RWMutex
	Colour    string
	Troops    int
	Countries int
	Password  string
	Ready     bool
}

type state struct {
	players      map[string]*PlayerState
	countries    map[string]*CountryState
	countryNames []string //A slice of all keys in countries
}

//PRE: callback doesn't modify any countryStates
func (s *state) RangeCountries(callback func(string, *CountryState)) {
	for name, country := range s.countries {
		func(name string, country *CountryState) {
			country.RLock()
			defer country.RUnlock()
			callback(name, country)
		}(name, country)
	}
}

//PRE: calllback doesn't modify any playerStates
func (s *state) RangePlayers(callback func(string, *PlayerState)) {
	for name, player := range s.players {
		func(name string, player *PlayerState) {
			player.RLock()
			defer player.RUnlock()
			callback(name, player)
		}(name, player)
	}
}

func (s *state) Destroy() {
	s.RangeCountries(func(name string, _ *CountryState) {
		delete(s.countries, name)
	})
	s.RangePlayers(func(name string, _ *PlayerState) {
		delete(s.players, name)
	})
}
