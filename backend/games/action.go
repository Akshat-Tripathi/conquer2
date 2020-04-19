package game

//Action - sent by the client, it encodes all the information about an action. Player is set by the server
type Action struct {
	Troops     int
	ActionType string
	Src        string
	Dest       string
	Player     string
}
