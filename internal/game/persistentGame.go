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

func newPersistentGame(ctx Context) *persistentGame {
	pg := &persistentGame{}

	pg.timer = time.NewTimer(herokuTimeOut)

	//This indicates that the context has already been loaded
	ctxAlreadyInit := ctx.MaxPlayers > 0

	if ctx.Client != nil {
		ctxAlreadyInit = true
		pg.persistence = &persistence{
			docs: ctx.Client.Collection(ctx.ID),
		}
	}

	if !ctxAlreadyInit {
		pg.loadContext(&ctx)
	}

	pg.DefaultGame = NewDefaultGame(ctx)

	if !ctxAlreadyInit {
		pg.numPlayers = int32(pg.loadPlayers(pg.processor))
		pg.loadCountries(pg.processor)
	}

	return pg
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

func (pg *persistentGame) end(winner string) {
	pg.persistence.delete()
	pg.DefaultGame.end(winner)
}
