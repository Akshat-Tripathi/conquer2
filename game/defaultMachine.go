package game

import "math/rand"

const (
	playerAdded = iota + 1
	playerAlreadyExists
	playerRejected
	gameFull
)

type defaultMachine struct {
	state
	canAcceptPlayers bool
	attackDisabled   bool
	donateDisabled   bool
	moveDisabled     bool
	dropDisabled     bool
	winCountries     int
}

var _ stateMachine = (*defaultMachine)(nil)

func (d *defaultMachine) init(countries []string) {
	d.countryNames = countries
	d.countries = make(map[string]*countryState)
	d.players = make(map[string]*playerState)
	for _, country := range countries {
		d.countries[country] = &countryState{}
	}
	d.canAcceptPlayers = true
}

func (d *defaultMachine) withLockedCountries(src, dest string, op func(src, dest *countryState) bool) bool {
	source, ok := d.countries[src]
	if !ok {
		return false
	}
	destination, ok := d.countries[dest]
	if !ok {
		return false
	}
	if src > dest {
		source.Lock()
		destination.Lock()
	} else {
		destination.Lock()
		source.Lock()
	}
	defer source.Unlock()
	defer destination.Unlock()
	return op(source, destination)
}

func (d *defaultMachine) withLockedPlayers(src, dest string, op func(src, dest *playerState) bool) bool {
	source, ok := d.players[src]
	if !ok {
		return false
	}
	destination, ok := d.players[dest]
	if !ok {
		return false
	}
	if src > dest {
		source.Lock()
		destination.Lock()
	} else {
		destination.Lock()
		source.Lock()
	}
	defer source.Unlock()
	defer destination.Unlock()
	return op(source, destination)
}

func (d *defaultMachine) attack(src, dest, player string) (valid, won, conquered bool, nSrc, nDest int) {
	srcCountry, ok := d.countries[src]
	if !ok {
		return false, false, false, 0, 0
	}
	destCountry, ok := d.countries[dest]
	if !ok {
		return false, false, false, 0, 0
	}
	if src > dest {
		srcCountry.Lock()
		destCountry.Lock()
	} else {
		destCountry.Lock()
		srcCountry.Lock()
	}
	defer srcCountry.Unlock()
	defer destCountry.Unlock()

	if d.attackValid(srcCountry, destCountry, player) {
		deltaSrc, deltaDest := 0, 0
		if destCountry.Troops != 0 {
			deltaSrc, deltaDest = defaultRng(srcCountry.Troops, destCountry.Troops)
		}
		srcCountry.Troops += deltaSrc
		destCountry.Troops += deltaDest

		if destCountry.Troops <= 0 {
			deltaDest -= destCountry.Troops
			destCountry.Troops = 0
			if srcCountry.Troops > 0 {
				//Conquered
				destCountry.Troops++
				srcCountry.Troops--

				source := d.players[srcCountry.Player]
				source.Lock()
				defer source.Unlock()
				source.Countries++
				if destCountry.Player != "" {
					destination := d.players[destCountry.Player]
					destination.Lock()
					defer destination.Unlock()
					destination.Countries--
				}
				destCountry.Player = player

				won := false
				if source.Countries == d.winCountries {
					won = true
				}
				return true, won, true, deltaSrc, deltaDest
			}
			return true, false, false, deltaSrc, deltaDest
		}
	}
	return false, false, false, 0, 0
}

func (d *defaultMachine) donate(src, dest string, troops int) bool {
	return d.withLockedPlayers(src, dest, func(src, dest *playerState) bool {
		if !d.donateValid(src, dest, troops) {
			return false
		}
		src.Troops -= troops
		dest.Troops += troops
		return true
	})
}

func (d *defaultMachine) assist(src, dest string, troops int, player string) bool {
	return d.withLockedCountries(src, dest, func(src, dest *countryState) bool {
		if !d.moveValid(src, player, troops) || src.Player == dest.Player {
			return false
		}
		src.Troops -= troops
		dest.Troops += troops
		return true
	})
}

func (d *defaultMachine) move(src, dest string, troops int, player string) bool {
	return d.withLockedCountries(src, dest, func(src, dest *countryState) bool {
		if !d.moveValid(src, player, troops) || src.Player != dest.Player {
			return false
		}
		src.Troops -= troops
		dest.Troops += troops
		return true
	})
}

func (d *defaultMachine) deploy(dest string, troops int, player string) bool {
	source, ok := d.players[player]
	if !ok {
		return false
	}
	destination, ok := d.countries[dest]
	if !ok {
		return false
	}
	source.Lock()
	defer source.Unlock()
	destination.Lock()
	defer destination.Unlock()
	if !d.deployValid(source, destination, player, troops) {
		return false
	}
	source.Troops -= troops
	destination.Troops += troops
	return true
}

//PRE: There will be countries available to assign
func (d *defaultMachine) addPlayer(name, password, colour string, troops, countries int) int8 {
	if player, ok := d.players[name]; ok {
		if player.Password == password {
			return playerAlreadyExists
		}
		return playerRejected
	}
	if !d.canAcceptPlayers {
		return gameFull
	}
	d.players[name] = &playerState{
		Colour:    colour,
		Troops:    troops,
		Countries: countries,
		Password:  password,
	}
	//Assign initial countries
	var countryName string
	for countries > 0 {
		countryName = d.countryNames[rand.Intn(len(d.countryNames))]
		func(country *countryState) {
			country.Lock()
			defer country.Unlock()
			if country.Player == "" {
				country.Player = name
				countries--
			}
		}(d.countries[countryName])
	}
	return playerAdded
}

//PRE: the country exists
func (d *defaultMachine) getOwner(country string) string {
	cState := d.countries[country]
	cState.Lock()
	defer cState.Unlock()
	return cState.Player
}

func (d *defaultMachine) attackValid(src, dest *countryState, player string) bool {
	if d.attackDisabled {
		return false
	}
	//Must own src
	if src.Player != player {
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

func (d *defaultMachine) donateValid(src, dest *playerState, troops int) bool {
	if d.donateDisabled {
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
	//Can't donate to self
	if dest.Colour == src.Colour {
		return false
	}
	return true
}

func (d *defaultMachine) moveValid(src *countryState, player string, troops int) bool {
	if d.moveDisabled {
		return false
	}
	//Must select neighbouring countries
	/*if !d.areNeighbours(move.Src, move.Dest) {
		return false
	}*/
	//troops must be > 0
	if troops < 0 {
		return false
	}
	//Must have troops
	if src.Troops < troops {
		return false
	}
	if src.Player != player {
		return false
	}
	return true
}

func (d *defaultMachine) deployValid(src *playerState, dest *countryState, player string, troops int) bool {
	if d.dropDisabled {
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
	//Must own dest
	if dest.Player != player {
		return false
	}
	return true
}

func (d *defaultMachine) processTroops() map[string]int {
	playerTroops := make(map[string]int)
	delta := 0
	for player, p := range d.players {
		func(p *playerState) {
			p.Lock()
			defer p.Unlock()

			delta = 3 + p.Countries/3
			p.Troops += delta
			playerTroops[player] = delta
		}(p)
	}

	return playerTroops
}

func (d *defaultMachine) stopAccepting() {
	d.canAcceptPlayers = false
}
