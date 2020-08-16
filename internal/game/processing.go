package game

import (
	"time"

	gs "github.com/Akshat-Tripathi/conquer2/internal/game/stateProcessors"
)

func (d *DefaultGame) lobbyProcess(name string, action Action) (done bool) {
	if action.ActionType != "imreadym9" {
		return
	}
	d.lobby.add(name)
	return d.context.MaxPlayers == d.lobby.length()
}

func (d *DefaultGame) process(name string, action Action) (done bool) {
	switch action.ActionType {
	case "attack":
		if !d.areNeighbours(action.Src, action.Dest) {
			return false
		}
		valid, won, conquered, deltaSrc, deltaDest :=
			d.processor.Attack(action.Src, action.Dest, name, action.Troops)
		if !valid {
			return false
		}
		if conquered {
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  1,
				Player:  name,
				Country: action.Dest,
				ID:      1,
			})
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaSrc - 1,
				Player:  name,
				Country: action.Src,
				ID:      2,
			})
			if won {
				d.sendToAll(UpdateMessage{
					Type:   "won",
					Player: name,
				})
				time.AfterFunc(time.Second*5, d.end)
				return true
			}
		} else {
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaDest,
				Player:  d.processor.GetCountry(action.Dest).Player,
				Country: action.Dest,
				ID:      3,
			})
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaSrc,
				Player:  name,
				Country: action.Src,
				ID:      4,
			})
		}
		return false
	case "donate":
		if !d.processor.Donate(name, action.Dest, action.Troops) {
			return false
		}
		d.sendToPlayer(action.Dest, UpdateMessage{
			Type:   "updateTroops",
			Troops: action.Troops,
			Player: action.Dest,
			ID:     5,
		})
		d.sendToPlayer(name, UpdateMessage{
			Type:   "updateTroops",
			Troops: -action.Troops,
			Player: name,
			ID:     6,
		})
	case "move":
		if !d.areNeighbours(action.Src, action.Dest) {
			return false
		}
		if !d.processor.Move(action.Src, action.Dest, action.Troops, name) {
			return false
		}
	case "assist":
		if !d.areNeighbours(action.Src, action.Dest) {
			return false
		}
		if !d.processor.Assist(action.Src, action.Dest, action.Troops, name) {
			return false
		}
	case "deploy":
		if d.processor.Deploy(action.Dest, action.Troops, name) {
			d.sendToPlayer(name, UpdateMessage{
				Type:   "updateTroops",
				Troops: -action.Troops,
				Player: name,
				ID:     7,
			})
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  action.Troops,
				Player:  name,
				Country: action.Dest,
				ID:      8,
			})
		}
		return false
	default:
		return false
	}
	d.sendToAll(UpdateMessage{
		Type:    "updateCountry",
		Troops:  -action.Troops,
		Player:  name,
		Country: action.Src,
		ID:      9,
	})
	d.sendToAll(UpdateMessage{
		Type:    "updateCountry",
		Troops:  action.Troops,
		Player:  d.processor.GetCountry(action.Dest).Player,
		Country: action.Dest,
		ID:      10,
	})
	return false
}

func (cg *CampaignGame) process(name string, action Action) bool {
	switch action.ActionType {
	case "attack":
		if !cg.areNeighbours(action.Src, action.Dest) {
			return false
		}
		oldPlayer := cg.processor.GetCountry(action.Dest).Player
		valid, won, conquered, deltaSrc, deltaDest :=
			cg.processor.Attack(action.Src, action.Dest, name, 1)
		if !valid {
			return false
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
				return true
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
		return false
	case "donate":
		if !cg.processor.Donate(name, action.Dest, action.Troops) {
			return false
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
			return false
		}
		if !cg.processor.Move(action.Src, action.Dest, action.Troops, name) {
			return false
		}
	case "assist":
		if !cg.areNeighbours(action.Src, action.Dest) {
			return false
		}
		if !cg.processor.Assist(action.Src, action.Dest, action.Troops, name) {
			return false
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
		return false
	default:
		return false
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
	return false
}
