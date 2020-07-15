package game

/*
The stateMachine interface provided methods used to manage the state of a game.
Therefore a stateMachine shouldn't contain data which isn't relevant to the state
for example, the defaultMachine has the field canAcceptPlayers, which was chosen
instead of having maxPlayerNumber and currentPlayer number, as neither of these are
related to the state
*/

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
