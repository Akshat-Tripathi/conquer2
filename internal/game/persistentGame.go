package game

import (
	"log"
	"time"

	"github.com/Akshat-Tripathi/conquer2/internal/game/common"
	"github.com/gin-gonic/gin"
)

const herokuTimeOut = time.Minute * 30

//persistentGame is a type of game which can store its state
//It overrides: Init, Run, process and End
//Since this type of game shouldn't ever be used directly, it doesn't have a lobby or fsm
type persistentGame struct {
	*DefaultGame
	*persistence
	timer *time.Timer
}

var _ Game = (*persistentGame)(nil)

func (pg *persistentGame) Init(ctx Context) {
	pg.timer = time.NewTimer(herokuTimeOut)
	pg.DefaultGame = &DefaultGame{}
	pg.persistence = &persistence{
		docs: ctx.Client.Collection(ctx.ID),
	}

	//This indicates that the context has already been loaded
	ctxAlreadyInit := ctx.MaxPlayers > 0

	if !ctxAlreadyInit {
		pg.loadContext(&ctx)
	}

	pg.DefaultGame.Init(ctx)

	if !ctxAlreadyInit {
		pg.numPlayers = int32(pg.loadPlayers(pg.processor))
		pg.loadCountries(pg.processor)
	}
}

func (pg *persistentGame) Run() func(ctx *gin.Context) {
	go func() {
		<-pg.timer.C
		log.Println("timer fired")
		pg.storeContext(pg.context)
		pg.store(pg.processor)
	}()
	return pg.DefaultGame.Run()
}

func (pg *persistentGame) process(name string, action common.Action) {
	log.Println("timer reset")
	pg.timer.Reset(herokuTimeOut)
	pg.DefaultGame.process(name, action)
}

func (pg *persistentGame) End() {
	pg.persistence.delete()
	pg.DefaultGame.end()
}
