package game

func (d *DefaultGame) lobbyProcess(name string, bool isReady) {
	d.sendToAll(ReadyUp{
		Type: "readyUp",
		Player: name,
		IsReady: isReady,
	})
	return
}

type ReadyUp struct {
	Type string //Type of update
	Player string //Player name
	IsReady bool // If Player is ready to play
}
