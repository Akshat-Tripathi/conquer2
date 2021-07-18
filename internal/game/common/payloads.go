package common

// Action - sent by the client, it encodes all the information about an action. Player is set by the server
type Action struct {
	Troops     int
	ActionType string
	Src        string
	Dest       string
}

// UpdateMessage - sent to client
type UpdateMessage struct {
	Troops int // delta troops
	// Type of update:
	// updateCountry ||
	// updateTroops ||
	// newPlayer ||
	// won ||
	// propose alliance
	// establish alliance
	// break alliance
	// deny alliance
	Type    string
	Player  string // Player that owns the country / dest player
	Country string // Could be the colour iff the type is newPlayer
	ID      int
}
