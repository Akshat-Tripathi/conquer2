package game

type stateMachine interface {
	init(countries []string)
	rangePlayers(callback func(string, *playerState))
	rangeCountries(callback func(string, *countryState))

	attack(src, dest, player string) (valid, won, conquered bool, nSrc, nDest int)
	donate(src, dest string, troops int) (valid bool)
	assist(src, dest string, troops int, player string) (valid bool)
	move(src, dest string, troops int, player string) (valid bool)
	deploy(dest string, troops int, player string) (valid bool)
	processTroops() map[string]int

	addPlayer(name, password, colour string, troops, countries int) int8
	getOwner(country string) string
	stopAccepting()

	destroy()
}
