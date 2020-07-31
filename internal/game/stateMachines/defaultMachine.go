package statemachines

import "math/rand"

//This enum is used when adding players
const (
	PlayerAdded = iota + 1
	PlayerAlreadyExists
	PlayerRejected
	GameFull
)

//DefaultMachine a state machine
type DefaultMachine struct {
	state
	canAcceptPlayers bool
	attackDisabled   bool
	donateDisabled   bool
	moveDisabled     bool
	dropDisabled     bool
	winCountries     int
}

//Init initialises the machine
func (d *DefaultMachine) Init(countries []string) {
	d.countryNames = countries
	d.countries = make(map[string]*CountryState)
	d.players = make(map[string]*PlayerState)
	for _, country := range countries {
		d.countries[country] = &CountryState{}
	}
	d.canAcceptPlayers = true
	d.winCountries = 177
}

func (d *DefaultMachine) withLockedCountries(src, dest string, op func(src, dest *CountryState) bool) bool {
	if src == dest {
		return false
	}
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

func (d *DefaultMachine) withLockedPlayers(src, dest string, op func(src, dest *PlayerState) bool) bool {
	if src == dest {
		return false
	}
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

//Attack attacks
func (d *DefaultMachine) Attack(src, dest, player string, times int) (valid, won, conquered bool, nSrc, nDest int) {
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

	if d.attackValid(srcCountry, destCountry, player, times) {
		deltaSrc, deltaDest := 0, 0
		if destCountry.Troops != 0 {
			deltaSrc, deltaDest = defaultRng(srcCountry.Troops, destCountry.Troops, times)
		}
		srcCountry.Troops += deltaSrc
		destCountry.Troops += deltaDest

		if destCountry.Troops <= 0 {
			deltaDest -= destCountry.Troops
			destCountry.Troops = 0
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
	return false, false, false, 0, 0
}

//Donate validates a donation
func (d *DefaultMachine) Donate(src, dest string, troops int) bool {
	return d.withLockedPlayers(src, dest, func(src, dest *PlayerState) bool {
		if !d.donateValid(src, dest, troops) {
			return false
		}
		src.Troops -= troops
		dest.Troops += troops
		return true
	})
}

//Assist allows a player to move troops into territory owned by another player
func (d *DefaultMachine) Assist(src, dest string, troops int, player string) bool {
	return d.withLockedCountries(src, dest, func(src, dest *CountryState) bool {
		if !d.moveValid(src, player, troops) || src.Player == dest.Player {
			return false
		}
		src.Troops -= troops
		dest.Troops += troops
		return true
	})
}

//Move allows intra-empire movement
func (d *DefaultMachine) Move(src, dest string, troops int, player string) bool {
	return d.withLockedCountries(src, dest, func(src, dest *CountryState) bool {
		if !d.moveValid(src, player, troops) || src.Player != dest.Player {
			return false
		}
		src.Troops -= troops
		dest.Troops += troops
		return true
	})
}

//Deploy allows players to move troops from their bases to their countries
func (d *DefaultMachine) Deploy(dest string, troops int, player string) bool {
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

//AddPlayer returns a status code
//PRE: There will be countries available to assign
func (d *DefaultMachine) AddPlayer(name, password, colour string, troops, countries int) int8 {
	if player, ok := d.players[name]; ok {
		if player.Password == password {
			return PlayerAlreadyExists
		}
		return PlayerRejected
	}
	if !d.canAcceptPlayers {
		return GameFull
	}
	d.players[name] = &PlayerState{
		Colour:    colour,
		Troops:    troops,
		Countries: countries,
		Password:  password,
	}
	startingCountries := countries
	//Assign initial countries
	var countryName string
	for countries > 0 {
		countryName = d.countryNames[rand.Intn(len(d.countryNames))]
		func(country *CountryState) {
			country.Lock()
			defer country.Unlock()
			if country.Player == "" {
				country.Player = name
				countries--
			} else if country.Troops == 0 {
				func() {
					owner := d.players[country.Player]
					owner.Lock()
					defer owner.Unlock()
					if owner.Countries > startingCountries {
						country.Player = name
						countries--
					}
				}()
			}
		}(d.countries[countryName])
	}
	return PlayerAdded
}

//GetCountry returns an copy of country
//PRE: the country exists
func (d *DefaultMachine) GetCountry(country string) CountryState {
	cState, ok := d.countries[country]
	if !ok {
		return CountryState{}
	}
	return *cState
}

//ToggleAttack - does what the name suggests
func (d *DefaultMachine) ToggleAttack() {
	d.attackDisabled = !d.attackDisabled
}

func (d *DefaultMachine) attackValid(src, dest *CountryState, player string, times int) bool {
	if d.attackDisabled && dest.Player != "" {
		if dest.Troops == 0 {
			//Prevents you from wiping the other player out entirely
			if func() bool {
				other := d.players[player]
				other.Lock()
				defer other.Unlock()

				return other.Countries == 1
			}() {
				return false
			}
		} else {
			return false
		}
	}
	if times <= 0 {
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

func (d *DefaultMachine) donateValid(src, dest *PlayerState, troops int) bool {
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

func (d *DefaultMachine) moveValid(src *CountryState, player string, troops int) bool {
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

func (d *DefaultMachine) deployValid(src *PlayerState, dest *CountryState, player string, troops int) bool {
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

//ProcessTroops returns the number of troops each player should receive
func (d *DefaultMachine) ProcessTroops() map[string]int {
	playerTroops := make(map[string]int)
	delta := 0
	for player, p := range d.players {
		func(p *PlayerState) {
			p.Lock()
			defer p.Unlock()

			delta = 3 + p.Countries/3
			p.Troops += delta
			playerTroops[player] = delta
		}(p)
	}

	return playerTroops
}

//StopAccepting should be used to indicate if a game is full
func (d *DefaultMachine) StopAccepting() {
	d.canAcceptPlayers = false
}
