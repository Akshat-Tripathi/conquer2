package stateprocessors

type validator interface {
	attackValid(src, dest *CountryState, player string, times int) bool
	donateValid(src, dest *PlayerState, troops int) bool
	deployValid(src *PlayerState, dest *CountryState, player string, troops int) bool
	moveValid(src *CountryState, player string, troops int) bool
}

type executor interface {
	Attack(src, dest, player string, times int) (valid, won, conquered bool, nSrc, nDest int)
	Donate(src, dest string, troops int) bool
	Assist(src, dest string, troops int, player string) bool
	Move(src, dest string, troops int, player string) bool
	Deploy(dest string, troops int, player string) bool
}

//StateProcessor is an interface defining what all stateprocessors are capable of
type StateProcessor interface {
	executor
	validator

	Init([]string)
	Destroy()

	RangeCountries(func(name string, country *CountryState))
	RangePlayers(func(name string, player *PlayerState))

	AddPlayer(name, password, colour string, troops, countries int) int8
	StopAccepting()

	ToggleAttack()

	GetCountry(country string) CountryState

	ProcessTroops() map[string]int
}
