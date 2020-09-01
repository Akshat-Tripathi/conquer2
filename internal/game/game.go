package game

import (
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
)

//Game provides the methods which every game should fulfil
type Game interface {
	Run() func(ctx *gin.Context)
	GetContext() Context
	AddReservation(player, password string) bool
	routePlayer(name, password string, ctx *gin.Context) (routed bool, reason string)
	end(winner string)
}

//Context stores the fields neccessary to initialise a game
type Context struct {
	ID                string
	MaxPlayers        int //IMPORTANT: is this necessary now that the lobby exists?
	StartingCountries int
	StartingTroops    int
	StartTime         time.Time
	Situation         string
	Minutes           int
	Colours           []string
	Client            *firestore.Client
	EventListener     chan<- Event
}

//These status codes are used to indicate the state of the game
const (
	StoppedAccepting = iota + 1
	PlayerLost
	Finished
)

//Event represents the most recent event processed by the game
type Event struct {
	ID    string
	Event int8
	Data  interface{}
}
