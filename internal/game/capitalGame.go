package game

import (
	"github.com/Akshat-Tripathi/conquer2/internal/game/common"
	stateprocessors "github.com/Akshat-Tripathi/conquer2/internal/game/stateProcessors"
)

// CapitalGame is a realtime game where all players have a capital
type CapitalGame struct {
	*DefaultGame
}

var _ Game = (*CapitalGame)(nil)

// NewCapitalGame creates a new CapitalGame from context
// PRE: ctx is valid
func NewCapitalGame(ctx Context) *CapitalGame {
	cg := &CapitalGame{}
	cg.DefaultGame = NewDefaultGame(ctx)
	cg.processor = stateprocessors.NewCapitalProcessor(*cg.processor.(*stateprocessors.DefaultProcessor))

	cg.sendInitialState = cg.sendInitialStateFunc
	return cg
}

func (cg *CapitalGame) sendInitialStateFunc(playerName string) {
	cg.DefaultGame.sendInitialStateFunc(playerName)
	cg.processor.(*stateprocessors.CapitalProcessor).RangeCapitals(func(player, capital string) {
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
