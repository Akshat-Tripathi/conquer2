package game

import (
	"github.com/Akshat-Tripathi/conquer2/internal/game/common"
	"github.com/Akshat-Tripathi/conquer2/internal/game/sockets"
	gs "github.com/Akshat-Tripathi/conquer2/internal/game/stateProcessors"
)

//CampaignGame is a subclass of DefaultGame which is a slower game lasting 2 weeks
//Overrides: Init, sendInitialStateFunc
type CampaignGame struct {
	*persistentGame
}

var _ Game = (*CampaignGame)(nil)

//NewCampaignGame creates a new CampaignGame from context
//PRE: ctx is valid
func NewCampaignGame(ctx Context) *CampaignGame {
	cg := &CampaignGame{}

	cg.persistentGame = newPersistentGame(ctx)
	cg.processor.ToggleAttack()
	cg.sendInitialState = cg.sendInitialStateFunc

	cg.FSM = sockets.NewFSM(cg.lobbyProcess, cg.process)
	cg.AddTransitions(func() {
		cg.SendToAll(common.UpdateMessage{
			Type: "start",
		})
		cg.processor.StopAccepting()
		cg.lobby.full = true
		cg.cron = tripleCron(ctx.StartTime, func() {
			for player, troops := range cg.processor.ProcessTroops() {
				cg.SendToPlayer(player, common.UpdateMessage{
					Troops: troops,
					Player: player,
					Type:   "updateTroops",
					ID:     timerSync,
				})
			}
		})
		eraCron(cg.cron, ctx.StartTime, cg.processor.ToggleAttack,
			func() {
				max := 0
				playerName := ""
				cg.processor.RangePlayers(func(name string, player *gs.PlayerState) {
					if max < player.Countries {
						playerName = name
					}
				})
				cg.SendToAll(common.UpdateMessage{
					Type:   "won",
					Player: playerName,
				})
				cg.End()
			},
		)
		cg.cron.Start()
	})
	cg.Start()
	cg.lobby = newLobby()

	//If Init is being called on an existing game
	if cg.numPlayers > 0 {
		cg.NextState()
	}

	return cg
}

func (cg *CampaignGame) sendInitialStateFunc(playerName string) {
	cg.processor.RangePlayers(func(name string, player *gs.PlayerState) {
		cg.SendToAll(common.UpdateMessage{
			Type:    "newPlayer",
			Player:  name,
			Country: player.Colour,
		})
		if name == playerName {
			cg.SendToPlayer(name, common.UpdateMessage{
				Troops: player.Troops,
				Type:   "updateTroops",
				Player: name,
			})
		}
	})

	cg.processor.RangeCountries(func(name string, country *gs.CountryState) {
		if country.Player == "" {
			return
		}
		var msg common.UpdateMessage
		msg = common.UpdateMessage{
			Troops:  country.Troops,
			Type:    "updateCountry",
			Player:  country.Player,
			Country: name,
		}
		if country.Player == playerName {
			if country.Troops == 0 {
				cg.sendToRelevantPlayers(name, msg)
			} else {
				cg.SendToPlayer(playerName, msg)
			}
		} else {
			if cg.countViewPoints(playerName, name) != 0 {
				cg.SendToPlayer(playerName, msg)
			}
		}
	})
	if cg.lobby.full {
		cg.SendToPlayer(playerName, common.UpdateMessage{
			Type: "start",
		})
	} else {
		cg.lobby.rangeLobby(func(player string) {
			cg.SendToPlayer(playerName, common.UpdateMessage{
				Type:   "readyPlayer",
				Player: player,
			})
		})
	}
}

func (cg *CampaignGame) countViewPoints(player, country string) int {
	viewPoints := 0
	if cg.processor.GetCountry(country).Player == player {
		viewPoints++
	}
	for _, neighbour := range cg.getNeighbours(country) {
		if cg.processor.GetCountry(neighbour).Player == player {
			viewPoints++
		}
	}
	return viewPoints
}

func (cg *CampaignGame) sendToRelevantPlayers(country string, msg common.UpdateMessage) {
	uniquePlayers := make(map[string]bool)
	uniquePlayers[cg.processor.GetCountry(country).Player] = true
	for _, neighbour := range cg.getNeighbours(country) {
		uniquePlayers[cg.processor.GetCountry(neighbour).Player] = true
	}

	for player := range uniquePlayers {
		cg.SendToPlayer(player, msg)
	}
}
