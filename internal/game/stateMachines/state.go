package statemachines

import "sync"

//CountryState represents a country
type CountryState struct {
	sync.Mutex
	Player string //Player that owns the country
	Troops int    //Troops in country
}

//PlayerState represents a player
type PlayerState struct {
	sync.Mutex
	Colour    string
	Troops    int
	Countries int
	Password  string
}

type state struct {
	players      map[string]*PlayerState
	countries    map[string]*CountryState
	countryNames []string //A slice of all keys in countries
}

func (s *state) RangeCountries(callback func(string, *CountryState)) {
	for name, country := range s.countries {
		func(name string, country *CountryState) {
			country.Lock()
			defer country.Unlock()
			callback(name, country)
		}(name, country)
	}
}

func (s *state) RangePlayers(callback func(string, *PlayerState)) {
	for name, player := range s.players {
		func(name string, player *PlayerState) {
			player.Lock()
			defer player.Unlock()
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
