package game

import (
	"time"

	"github.com/gin-gonic/gin"
)

const troopInterval = time.Second * 60

//RealTimeGame - a subclass of game where actions happen as they are sent
type RealTimeGame struct {
	game
	router *gin.Engine
}

//Start - starts a game
func (rtg *RealTimeGame) Start(id string) {
	rtg.router.GET("/game/"+id+"/", func(c *gin.Context) {
		rtg.handleNewPlayer(c.Writer, c.Request)
	})
	rtg.processActions()
}
