package game

import (
	"sync"

	"github.com/gin-gonic/gin"
)

//CampaignGame - a subclass of DefaultGame which is a slower game lasting 2 weeks
type CampaignGame struct {
	*DefaultGame
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

	processor := campaignProcessor{
		countries:             countries,
		situation:             ctx.Situation,
		countryStates:         countryStates,
		playerTroops:          make(map[string]*playerState),
		startingTroopNumber:   ctx.StartingTroopNumber,
		startingCountryNumber: ctx.StartingCountryNumber,
		maxPlayerNum:          ctx.MaxPlayerNumber,
	}

	cg.id = ctx.ID
	cg.maxPlayerNum = ctx.MaxPlayerNumber
	cg.colours = ctx.Colours //TODO shuffle these
	cg.conn = connectionManager{sync.Map{}}
	cg.requests = make(chan Action)
	cg.processor = &processor
	cg.troopInterval = ctx.TroopInterval
	go cg.processActions()

	//TODO abstract the router out of this struct
	cg.Router.GET("/game/"+ctx.ID+"/ws", cg.handleGame)
}
