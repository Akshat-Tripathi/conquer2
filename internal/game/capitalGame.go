package game

import stateprocessors "github.com/Akshat-Tripathi/conquer2/internal/game/stateProcessors"

//CapitalGame is a realtime game where all players playthrough till the end
type CapitalGame struct {
	DefaultGame
}

var _ Game = (*CapitalGame)(nil)

//Init replaces the DefaultGame's state processor
func (cg *CapitalGame) Init(ctx Context) {
	cg.DefaultGame.Init(ctx)
	teamProcessor := &stateprocessors.TeamProcessor{}
	teamProcessor.DefaultProcessor = *cg.processor.(*stateprocessors.DefaultProcessor)
	cg.processor = teamProcessor
	cg.processor.Init(nil)
	cg.sendInitialState = cg.sendInitialStateFunc
}

func (cg *CapitalGame) sendInitialStateFunc(playerName string) {
	cg.DefaultGame.sendInitialStateFunc(playerName)
	cg.processor.(*stateprocessors.TeamProcessor).RangeCapitals(func(player, capital string) {
		cg.sendToAll(UpdateMessage{
			Type:    "newCapital",
			Player:  player,
			Country: capital,
		})
	})
}