package game

//NormalGame - basic test version
type NormalGame struct {
	state map[string]gameState
	conn  connectionManager
}
