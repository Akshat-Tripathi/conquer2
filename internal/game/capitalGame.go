package game

import (
	"github.com/Akshat-Tripathi/conquer2/internal/game/common"
	stateprocessors "github.com/Akshat-Tripathi/conquer2/internal/game/stateProcessors"
)

//CapitalGame is a realtime game where all players have a capital
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
		if player == playerName {
			cg.SendToAll(common.UpdateMessage{
				Type:    "newCapital",
				Player:  player,
				Country: capital,
				Troops:  cg.processor.GetCountry(capital).Troops,
			})
		} else {
			cg.SendToPlayer(playerName, common.UpdateMessage{
				Type:    "newCapital",
				Player:  player,
				Country: capital,
			})
		}
	})
}
