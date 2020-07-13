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

func (s *state) rangeState(callback func(string, interface{})) {
	for name, country := range s.countries {
		func(name string, country *countryState) {
			country.Lock()
			defer country.Unlock()
			callback(name, *country)
		}(name, country)
	}

	for name, player := range s.players {
		go func(name string, player *playerState) {
			player.Lock()
			defer player.Unlock()
			callback(name, *player)
		}(name, player)
	}
}

func (s *state) destroy() {
	s.rangeState(func(name string, i interface{}) {
		switch i.(type) {
		case playerState:
			delete(s.players, name)
		case countryState:
			delete(s.countries, name)
		}
	})
}
