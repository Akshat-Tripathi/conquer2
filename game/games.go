package game

import (
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
)

//Game provides the methods which every game should fulfil
type Game interface {
	Init(Context)
	Run() func(ctx *gin.Context)
	RoutePlayer(name, password string, ctx *gin.Context) (routed bool, reason string)
	End()

	process(name string, action Action)
	sendInitialState(player string)
}

//Context stores the fields neccessary to initialise a game
type Context struct {
	ID                string
	MaxPlayers        int
	StartingCountries int
	StartingTroops    int
	StartTime         time.Time
	Situation         string
	Minutes           int
	Colours           []string
	Client            *firestore.Client
}
