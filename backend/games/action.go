package game

//This stores the action class, and all subclasses

//Action - top level action class
type Action struct {
	Src    string
	Dest   string
	Player string
}

//Attack - an attacking action
type Attack struct {
	Action
}

//Donate - a donating action
type Donate struct {
	Action
	Troops int
}

//Move - a movement action
type Move struct {
	Action
	Troops int
}

//Drop - sends troop to players
type Drop struct {
	Action
	Troops int
}

//Nuke - Attack but with a different range
//TODO - Nuke
