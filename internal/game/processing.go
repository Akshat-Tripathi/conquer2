package game

import (
	"strings"

	"github.com/Akshat-Tripathi/conquer2/internal/game/common"
	gs "github.com/Akshat-Tripathi/conquer2/internal/game/stateProcessors"
)

const (
	timerSync = iota + 1
	conquestDest
	conquestSrc
	attackDest
	attackSrc
	donationDest
	donationSrc
	deployDest
	deploySrc
	moveDest
	moveSrc
	ally
	proposeAlliance
	denyAlliance
	breakAlliance
)

func (d *DefaultGame) lobbyProcess(name string, action common.Action) (done bool) {
	if action.ActionType != "imreadym9" {
		return
	}
	d.lobby.add(name)
	d.SendToAll(common.UpdateMessage{
		Type:   "readyPlayer",
		Player: name,
	})
	return d.numPlayers > 1 && int(d.numPlayers) == d.lobby.length() && len(d.lobby.reservedPlayers) == 0
}

func (d *DefaultGame) process(name string, action common.Action) (done bool) {
	if strings.Contains(action.ActionType, "alliance") {
		d.processAlliance(name, action)
		return false
	}
	switch action.ActionType {
	case "attack":
		if !d.areNeighbours(action.Src, action.Dest) {
			return false
		}
		oldPlayer := d.processor.GetCountry(action.Dest).Player
		valid, won, conquered, deltaSrc, deltaDest, playerLost :=
			d.processor.Attack(action.Src, action.Dest, name, action.Troops)
		if !valid {
			return false
		}
		d.alliances.breakAlliance(name, oldPlayer, false)
		if conquered {
			d.SendToAll(common.UpdateMessage{
				Type:    "updateCountry",
				Troops:  1,
				Player:  name,
				Country: action.Dest,
				ID:      conquestDest,
			})
			d.SendToAll(common.UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaSrc - 1,
				Player:  name,
				Country: action.Src,
				ID:      conquestSrc,
			})
			if won {
				d.SendToAll(common.UpdateMessage{
					Type:   "won",
					Player: name,
				})
				d.end(name)
				return true
			}
			if playerLost != "" {
				d.context.EventListener <- Event{
					ID:    d.context.ID,
					Event: PlayerLost,
					Data:  playerLost,
				}
			}
		} else {
			d.SendToAll(common.UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaDest,
				Player:  d.processor.GetCountry(action.Dest).Player,
				Country: action.Dest,
				ID:      attackDest,
			})
			d.SendToAll(common.UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaSrc,
				Player:  name,
				Country: action.Src,
				ID:      attackSrc,
			})
		}
		return false
	case "donate":
		if !d.processor.Donate(name, action.Dest, action.Troops) {
			return false
		}
		d.SendToPlayer(action.Dest, common.UpdateMessage{
			Type:   "updateTroops",
			Troops: action.Troops,
			Player: action.Dest,
			ID:     donationDest,
		})
		d.SendToPlayer(name, common.UpdateMessage{
			Type:   "updateTroops",
			Troops: -action.Troops,
			Player: name,
			ID:     donationSrc,
		})
		return false
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
			d.SendToPlayer(name, common.UpdateMessage{
				Type:   "updateTroops",
				Troops: -action.Troops,
				Player: name,
				ID:     deploySrc,
			})
			d.SendToAll(common.UpdateMessage{
				Type:    "updateCountry",
				Troops:  action.Troops,
				Player:  name,
				Country: action.Dest,
				ID:      deployDest,
			})
		}
		return false
	default:
		return false
	}
	d.SendToAll(common.UpdateMessage{
		Type:    "updateCountry",
		Troops:  action.Troops,
		Player:  d.processor.GetCountry(action.Dest).Player,
		Country: action.Dest,
		ID:      moveDest,
	})
	d.SendToAll(common.UpdateMessage{
		Type:    "updateCountry",
		Troops:  -action.Troops,
		Player:  name,
		Country: action.Src,
		ID:      moveSrc,
	})
	return false
}

func (cg *CampaignGame) process(name string, action common.Action) bool {
	cg.persistentGame.Reset()
  if strings.Contains(action.ActionType, "alliance") {
		cg.processAlliance(name, action)
		return false
  }
	switch action.ActionType {
	case "attack":
		if !cg.areNeighbours(action.Src, action.Dest) {
			return false
		}
		oldPlayer := cg.processor.GetCountry(action.Dest).Player
		valid, won, conquered, deltaSrc, deltaDest, playerLost :=
			cg.processor.Attack(action.Src, action.Dest, name, 1)
		if !valid {
			return false
		}
		cg.alliances.breakAlliance(name, oldPlayer, false)
		if conquered {
			if cg.countViewPoints(oldPlayer, action.Dest) == 0 {
				cg.SendToPlayer(oldPlayer, common.UpdateMessage{
					Type:    "updateCountry",
					Troops:  0,
					Country: action.Dest,
				})
			}
			cg.sendToRelevantPlayers(action.Dest, common.UpdateMessage{
				Type:    "updateCountry",
				Troops:  1,
				Player:  name,
				Country: action.Dest,
			})
			cg.sendToRelevantPlayers(action.Src, common.UpdateMessage{
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
					cg.SendToPlayer(name, common.UpdateMessage{
						Type:    "updateCountry",
						Country: neighbour,
						Troops:  country.Troops,
						Player:  country.Player,
					})
				}
				if cg.countViewPoints(oldPlayer, neighbour) == 0 {
					cg.SendToPlayer(oldPlayer, common.UpdateMessage{
						Type:    "updateCountry",
						Country: neighbour,
						Troops:  0,
					})
				}
			}
			if won {
				cg.SendToAll(common.UpdateMessage{
					Type:   "won",
					Player: name,
				})
				cg.end(name)
				return true
			}
			if playerLost != "" {
				cg.context.EventListener <- Event{
					ID:    cg.context.ID,
					Event: PlayerLost,
					Data:  playerLost,
				}
			}
		} else {
			cg.sendToRelevantPlayers(action.Dest, common.UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaDest,
				Player:  oldPlayer,
				Country: action.Dest,
			})
			cg.sendToRelevantPlayers(action.Src, common.UpdateMessage{
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
		cg.SendToPlayer(action.Dest, common.UpdateMessage{
			Type:   "updateTroops",
			Troops: action.Troops,
			Player: action.Dest,
		})
		cg.SendToPlayer(name, common.UpdateMessage{
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
			cg.SendToPlayer(name, common.UpdateMessage{
				Type:   "updateTroops",
				Troops: -action.Troops,
				Player: name,
			})
			cg.sendToRelevantPlayers(action.Dest, common.UpdateMessage{
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
	cg.sendToRelevantPlayers(action.Src, common.UpdateMessage{
		Type:    "updateCountry",
		Troops:  -action.Troops,
		Player:  name,
		Country: action.Src,
	})
	cg.sendToRelevantPlayers(action.Dest, common.UpdateMessage{
		Type:    "updateCountry",
		Troops:  action.Troops,
		Player:  cg.processor.GetCountry(action.Dest).Player,
		Country: action.Dest,
	})
	return false
}

func (d *DefaultGame) processAlliance(name string, action common.Action) {
	if d.alliances.areAllied(action.Src, action.Dest) {
		return
	}
	player1 := action.Src
	player2 := action.Dest
	actionType := action.ActionType[len("alliance"):]
	switch actionType {
	case "accept":
		if name == player2 {
			d.alliances.addAlliance(player1, player2, action.Troops)
		}
	case "decline":
		if name == player2 {
			d.SendToPlayer(player1, common.UpdateMessage{
				Type:   "deny",
				Player: player2,
				ID:     denyAlliance,
			})
			d.SendToPlayer(player2, common.UpdateMessage{
				Type:   "deny",
				Player: player1,
				ID:     denyAlliance,
			})
		}
	case "propose":
		if name == player1 {
			d.SendToPlayer(player2, common.UpdateMessage{
				Type:   "propose",
				Player: player1,
				ID:     proposeAlliance,
				Troops: action.Troops,
			})
		}
	}
}
