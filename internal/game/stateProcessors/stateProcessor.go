package stateprocessors

type validator interface {
	attackValid(src, dest *CountryState, player string, times int) bool
	donateValid(src, dest *PlayerState, troops int) bool
	deployValid(src *PlayerState, dest *CountryState, player string, troops int) bool
	moveValid(src *CountryState, player string, troops int) bool
	allianceValid(src, dest *PlayerState, cost int) bool
}

type executor interface {
	Attack(src, dest, player string, times int) (valid, won, conquered bool, nSrc, nDest int, playerLost string)
	Donate(src, dest string, troops int) bool
	Assist(src, dest string, troops int, player string) bool
	Move(src, dest string, troops int, player string) bool
	Deploy(dest string, troops int, player string) bool
	Ally(src, dest string, cost int) bool
}

// StateProcessor is an interface defining what all stateprocessors are capable of
type StateProcessor interface {
	executor
	validator

	Destroy()

	RangeCountries(func(name string, country *CountryState))
	RangePlayers(func(name string, player *PlayerState))

	AddPlayer(name, password, colour string, troops, countries int) int8
	AddTroops(name string, troops int)
	StopAccepting()

	ToggleAttack()

	GetCountry(country string) CountryState

	ProcessTroops() map[string]int
}
