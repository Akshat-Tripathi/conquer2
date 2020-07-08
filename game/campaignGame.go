package game

import (
	"fmt"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

//CampaignGame - a subclass of DefaultGame which is a slower game lasting 2 weeks
type CampaignGame struct {
	*DefaultGame
	cp     *campaignProcessor //! This only exists to remove extra casting
	Router *gin.Engine
}

//Start - starts a DefaultGame
func (cg *CampaignGame) Start(ctx Context) {
	countries := make([]string, len(ctx.Situation))
	countryStates := make(map[string]*countryState)

	i := 0
	for k := range ctx.Situation {
		countries[i] = k
		countryStates[k] = new(countryState)
		i++
	}

	maxCountries := len(countries) / ctx.MaxPlayerNumber
	if maxCountries < ctx.StartingCountryNumber {
		ctx.StartingCountryNumber = maxCountries
	}

	processor := campaignProcessor{}
	processor.countries = countries
	processor.situation = ctx.Situation
	processor.countryStates = countryStates
	processor.playerTroops = make(map[string]*playerState)
	processor.startingTroopNumber = ctx.StartingTroopNumber
	processor.startingCountryNumber = ctx.StartingCountryNumber
	processor.maxPlayerNum = ctx.MaxPlayerNumber

	cg.id = ctx.ID
	cg.maxPlayerNum = ctx.MaxPlayerNumber
	cg.colours = ctx.Colours //TODO shuffle these
	cg.conn = connectionManager{sync.Map{}}
	cg.requests = make(chan Action)
	cg.processor = &processor
	cg.troopInterval = time.Hour * 8
	cg.cp = &processor
	go cg.processActions()

	//TODO abstract the router out of this struct
	cg.Router.GET("/game/"+ctx.ID+"/ws", cg.handleGame)
}

//Overrides processActions
func (cg *CampaignGame) processActions() {
	for action := range cg.requests {
		var prevPlayer string
		if action.ActionType == "attack" {
			prevPlayer = cg.cp.countryStates[action.Dest].Player
		}
		won, msg1, msg2 := cg.processor.processAction(action)
		cg.send(msg1)
		cg.send(msg2)
		//If a country has just been conquered
		if action.ActionType == "attack" && prevPlayer != msg1.Player {
			//Tell previous owner that the land has been conquered
			if !cg.cp.canSee(prevPlayer, msg1.Country) {
				msg1.Player = ""
				msg1.Troops = 0
				cg.conn.sendToPlayer(msg1, prevPlayer)
			}

			//Send new countries to player
			//And hide ones which aren't visible anymore
			var isNew bool
			for _, neighbour := range cg.cp.situation[msg1.Country] {
				if cg.cp.countryStates[neighbour].Player != msg2.Player {
					//TODO put this in canSee
					isNew = true
					//* neighbour squared since it's the neighbour of a neighbour
					for _, neighbourSq := range cg.cp.situation[neighbour] {
						if neighbourSq != msg1.Country && cg.cp.countryStates[neighbourSq].Player == msg2.Player {
							isNew = false
						}
					}
					if isNew {
						cg.conn.sendToPlayer(UpdateMessage{
							Troops:  cg.cp.countryStates[neighbour].Troops,
							Type:    "updateCountry",
							Player:  cg.cp.countryStates[neighbour].Player,
							Country: neighbour,
						}, msg2.Player)
					}
				}
				if !cg.cp.canSee(prevPlayer, neighbour) {
					cg.conn.sendToPlayer(UpdateMessage{
						Troops:  0,
						Type:    "updateCountry",
						Player:  "",
						Country: neighbour,
					}, prevPlayer)
				}
			}
		}
		if won {
			cg.numPlayers = 0
			go func() {
				time.Sleep(time.Second * 5)
				close(cg.requests)
			}()
		}
	}
}

//Sends actions to the appropriate clients
func (cg *CampaignGame) send(msg UpdateMessage) {
	if msg.Type == "updateTroops" {
		cg.conn.sendToPlayer(msg, msg.Player)
		return
	}
	cg.processor.(*campaignProcessor).rangeRelevantPlayers(msg.Country, func(player string) {
		fmt.Println(msg, player)
		cg.conn.sendToPlayer(msg, player)
	})
}
