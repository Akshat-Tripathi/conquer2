package game

import (
	gs "github.com/Akshat-Tripathi/conquer2/internal/game/stateProcessors"
)

//CampaignGame is a subclass of DefaultGame which is a slower game lasting 2 weeks
//Overrides: Init, sendInitialStateFunc
type CampaignGame struct {
	*persistentGame
}

var _ Game = (*CampaignGame)(nil)

//Init initialises a persistentGame then sets the sendInitialState function
func (cg *CampaignGame) Init(ctx Context) {
	cg.persistentGame = &persistentGame{}
	cg.persistentGame.Init(ctx)
	cg.processor.ToggleAttack()
	cg.sendInitialState = cg.sendInitialStateFunc
	cg.handle = cg.process

	cg.cron = tripleCron(ctx.StartTime, func() {
		for player, troops := range cg.processor.ProcessTroops() {
			cg.sendToPlayer(player, UpdateMessage{
				Troops: troops,
				Player: player,
				Type:   "updateTroops",
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
			cg.sendToAll(UpdateMessage{
				Type:   "won",
				Player: playerName,
			})
			cg.End()
		},
	)
}

func (cg *CampaignGame) sendInitialStateFunc(playerName string) {
	cg.processor.RangePlayers(func(name string, player *gs.PlayerState) {
		cg.sockets.sendToAll(UpdateMessage{
			Type:    "newPlayer",
			Player:  name,
			Country: player.Colour,
		})
		if name == playerName {
			cg.sendToPlayer(name, UpdateMessage{
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
		var msg UpdateMessage
		msg = UpdateMessage{
			Troops:  country.Troops,
			Type:    "updateCountry",
			Player:  country.Player,
			Country: name,
		}
		if country.Player == playerName {
			if country.Troops == 0 {
				cg.sendToRelevantPlayers(name, msg)
			} else {
				cg.sendToPlayer(playerName, msg)
			}
		} else {
			if cg.countViewPoints(playerName, name) != 0 {
				cg.sendToPlayer(playerName, msg)
			}
		}
	})
}

func (cg *CampaignGame) process(name string, action Action) {
	switch action.ActionType {
	case "attack":
		if !cg.areNeighbours(action.Src, action.Dest) {
			return
		}
		oldPlayer := cg.processor.GetCountry(action.Dest).Player
		valid, won, conquered, deltaSrc, deltaDest :=
			cg.processor.Attack(action.Src, action.Dest, name, 1)
		if !valid {
			return
		}
		if conquered {
			if cg.countViewPoints(oldPlayer, action.Dest) == 0 {
				cg.sendToPlayer(oldPlayer, UpdateMessage{
					Type:    "updateCountry",
					Troops:  0,
					Country: action.Dest,
				})
			}
			cg.sendToRelevantPlayers(action.Dest, UpdateMessage{
				Type:    "updateCountry",
				Troops:  1,
				Player:  name,
				Country: action.Dest,
			})
			cg.sendToRelevantPlayers(action.Src, UpdateMessage{
				Type:    "updateCountry",
				Troops:  -1 - deltaSrc,
				Player:  name,
				Country: action.Src,
			})

			var country gs.CountryState
			for _, neighbour := range cg.getNeighbours(action.Dest) {
				if neighbour == action.Src {
					continue
				}
				if cg.countViewPoints(name, neighbour) == 1 {
					country = cg.processor.GetCountry(neighbour)
					cg.sendToPlayer(name, UpdateMessage{
						Type:    "updateCountry",
						Country: neighbour,
						Troops:  country.Troops,
						Player:  country.Player,
					})
				}
				if cg.countViewPoints(oldPlayer, neighbour) == 0 {
					cg.sendToPlayer(oldPlayer, UpdateMessage{
						Type:    "updateCountry",
						Country: neighbour,
						Troops:  0,
					})
				}
			}
			if won {
				cg.sendToAll(UpdateMessage{
					Type:   "won",
					Player: name,
				})
				cg.End()
			}
		} else {
			cg.sendToRelevantPlayers(action.Dest, UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaDest,
				Player:  oldPlayer,
				Country: action.Dest,
			})
			cg.sendToRelevantPlayers(action.Src, UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaSrc,
				Player:  name,
				Country: action.Src,
			})
		}
		return
	case "donate":
		if !cg.processor.Donate(name, action.Dest, action.Troops) {
			return
		}
		cg.sendToPlayer(action.Dest, UpdateMessage{
			Type:   "updateTroops",
			Troops: action.Troops,
			Player: action.Dest,
		})
		cg.sendToPlayer(name, UpdateMessage{
			Type:   "updateTroops",
			Troops: -action.Troops,
			Player: name,
		})
	case "move":
		if !cg.areNeighbours(action.Src, action.Dest) {
			return
		}
		if !cg.processor.Move(action.Src, action.Dest, action.Troops, name) {
			return
		}
	case "assist":
		if !cg.areNeighbours(action.Src, action.Dest) {
			return
		}
		if !cg.processor.Assist(action.Src, action.Dest, action.Troops, name) {
			return
		}
	case "deploy":
		if cg.processor.Deploy(action.Dest, action.Troops, name) {
			cg.sendToPlayer(name, UpdateMessage{
				Type:   "updateTroops",
				Troops: -action.Troops,
				Player: name,
			})
			cg.sendToRelevantPlayers(action.Dest, UpdateMessage{
				Type:    "updateCountry",
				Troops:  action.Troops,
				Player:  name,
				Country: action.Dest,
			})
		}
		return
	default:
		return
	}
	cg.sendToRelevantPlayers(action.Src, UpdateMessage{
		Type:    "updateCountry",
		Troops:  -action.Troops,
		Player:  name,
		Country: action.Src,
	})
	cg.sendToRelevantPlayers(action.Dest, UpdateMessage{
		Type:    "updateCountry",
		Troops:  action.Troops,
		Player:  cg.processor.GetCountry(action.Dest).Player,
		Country: action.Dest,
	})
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

func (cg *CampaignGame) sendToRelevantPlayers(country string, msg UpdateMessage) {
	uniquePlayers := make(map[string]bool)
	uniquePlayers[cg.processor.GetCountry(country).Player] = true
	for _, neighbour := range cg.getNeighbours(country) {
		uniquePlayers[cg.processor.GetCountry(neighbour).Player] = true
	}

	for player := range uniquePlayers {
		cg.sendToPlayer(player, msg)
	}
}
