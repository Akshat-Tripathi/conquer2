package game

import "encoding/json"

type Action interface {
	toString() string
}

//This stores the action class, and all subclasses

//Action - top level action class
type action struct {
	Src    string
	Dest   string
	Player string
}

func (a action) toString() string {
	str, _ := json.Marshal(a)
	return string(str)
}

//Attack - an attacking action
type Attack struct {
	action
}

//Donate - a donating action
type Donate struct {
	action
	Troops int
}

//Move - a movement action
type Move struct {
	action
	Troops int
}

//Drop - sends troop to players
type Drop struct {
	action
	Troops int
}

//Nuke - Attack but with a different range
//TODO - Nuke
