package game

import (
	"log"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
)

const herokuTimeOut = time.Minute * 25

// persistentGame is a type of game which can store its state
// It overrides: Init, Run, process and End
// Since this type of game shouldn't ever be used directly, it doesn't have a lobby or fsm
type persistentGame struct {
	*DefaultGame
	*persistence
	timer *time.Timer
	dirty uint32
}

var _ Game = (*persistentGame)(nil)

func newPersistentGame(ctx Context) *persistentGame {
	pg := &persistentGame{}

	pg.timer = time.NewTimer(herokuTimeOut)

	pg.persistence = &persistence{
		docs: ctx.Client.Collection(ctx.ID),
	}

	alreadyExists := pg.loadContext(&ctx)

	pg.DefaultGame = NewDefaultGame(ctx)

	if alreadyExists {
		pg.numPlayers = int32(pg.loadPlayers(pg.processor))
		pg.loadCountries(pg.processor)
	}

	return pg
}

func (pg *persistentGame) Run() func(ctx *gin.Context) {
	go func() {
		for {
			<-pg.timer.C
			log.Println("timer fired")
			if pg.dirty > 0 {
				pg.storeContext(pg.context)
				pg.store(pg.processor)
			}
			pg.timer.Reset(herokuTimeOut)
		}
	}()
	return pg.DefaultGame.Run()
}

func (pg *persistentGame) Reset() {
	log.Println("Timer reset")
	pg.timer.Reset(herokuTimeOut)
	atomic.AddUint32(&pg.dirty, 1)
}

func (pg *persistentGame) end(winner string) {
	pg.persistence.delete()
	pg.DefaultGame.end(winner)
}
