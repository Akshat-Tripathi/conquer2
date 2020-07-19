package statemachines

//TODO maybe split into smaller interfaces

//StateMachine is an interface defining what all statemachines are capable of
type StateMachine interface {
	Init([]string)
	Destroy()

	RangeCountries(func(name string, country *CountryState))
	RangePlayers(func(name string, player *PlayerState))

	AddPlayer(name, password, colour string, troops, countries int) int8
	StopAccepting()

	ToggleAttack()

	Attack(src, dest, player string) (valid, won, conquered bool, nSrc, nDest int)
	Donate(src, dest string, troops int) bool
	Assist(src, dest string, troops int, player string) bool
	Move(src, dest string, troops int, player string) bool
	Deploy(dest string, troops int, player string) bool

	GetCountry(country string) CountryState

	ProcessTroops() map[string]int
}
