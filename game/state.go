package game

import "sync"

type countryState struct {
	sync.Mutex
	Player string //Player that owns the country
	Troops int    //Troops in country
}

type playerState struct {
	sync.Mutex
	Colour    string
	Troops    int
	Countries int
	Password  string
}

type state struct {
	players      map[string]*playerState
	countries    map[string]*countryState
	countryNames []string //A slice of all keys in countries
}

func (s *state) rangeCountries(callback func(string, *countryState)) {
	for name, country := range s.countries {
		func(name string, country *countryState) {
			country.Lock()
			defer country.Unlock()
			callback(name, country)
		}(name, country)
	}
}

func (s *state) rangePlayers(callback func(string, *playerState)) {
	for name, player := range s.players {
		func(name string, player *playerState) {
			player.Lock()
			defer player.Unlock()
			callback(name, player)
		}(name, player)
	}
}

func (s *state) destroy() {
	s.rangeCountries(func(name string, _ *countryState) {
		delete(s.countries, name)
	})
	s.rangePlayers(func(name string, _ *playerState) {
		delete(s.players, name)
	})
}
