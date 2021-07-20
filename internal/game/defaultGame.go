package game

import (
	"net/http"
	"sync/atomic"
	"time"

	"github.com/Akshat-Tripathi/conquer2/internal/game/common"
	"github.com/Akshat-Tripathi/conquer2/internal/game/sockets"
	gs "github.com/Akshat-Tripathi/conquer2/internal/game/stateProcessors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/robfig/cron"
)

var upgrader websocket.Upgrader

// DefaultGame is a realtime game, comparable to the RealTimeGame struct of v2
type DefaultGame struct {
	situation
	*sockets.Sockets
	processor  gs.StateProcessor
	context    Context
	numPlayers int32
	cron       *cron.Cron
	lobby      *lobby
	alliances  *alliances

	sendInitialState func(string)
}

var _ Game = (*DefaultGame)(nil)

// NewDefaultGame creates a new DefaultGame from context
// PRE: ctx must be valid
func NewDefaultGame(ctx Context) *DefaultGame {
	d := &DefaultGame{}
	d.context = ctx
	d.Sockets = sockets.NewSockets()
	d.FSM = sockets.NewFSM(d.lobbyProcess, d.process)
	d.AddTransitions(func() {
		d.SendToAll(common.UpdateMessage{
			Type: "start",
		})
		d.processor.StopAccepting()
		go func() {
			d.context.EventListener <- Event{
				ID:    ctx.ID,
				Event: StoppedAccepting,
			}
		}()
		d.lobby.full = true
		d.cron = minuteCron(d.context.Minutes, func() {
			for player, troops := range d.processor.ProcessTroops() {
				d.SendToPlayer(player, common.UpdateMessage{
					Troops: troops,
					Player: player,
					Type:   "updateTroops",
					ID:     timerSync,
				})
			}
		})
		d.context.StartTime = time.Now()
		d.cron.Start()
	})
	d.Start()

	d.lobby = newLobby()

	d.situation = situations[ctx.Situation]

	countries := make([]string, len(d.situation.countryMap))
	i := 0
	for country := range d.situation.countryMap {
		countries[i] = country
		i++
	}
	d.processor = gs.NewDefaultProcessor(countries)
	d.alliances = newAlliances(d.Sockets, d.processor)
	maxCountries := len(countries) / ctx.MaxPlayers
	if ctx.StartingCountries > maxCountries {
		d.context.StartingCountries = maxCountries
	}

	d.sendInitialState = d.sendInitialStateFunc
	return d
}

// routePlayer will either add a new player, connect an existing player or reject the player
func (d *DefaultGame) routePlayer(name, password string, ctx *gin.Context) (routed bool, reason string) {
	if int(d.numPlayers) == d.context.MaxPlayers {
		d.processor.StopAccepting()
	}
	switch d.processor.AddPlayer(name, password, d.context.Colours[d.numPlayers],
		d.context.StartingTroops, d.context.StartingCountries) {
	case gs.GameFull:
		return false, "Game full"
	case gs.PlayerAdded:
		atomic.AddInt32(&d.numPlayers, 1)
		fallthrough
	case gs.PlayerAlreadyExists:
		d.NewPlayer(ctx.Writer, ctx.Request, name)
		// Send initial state
		d.sendInitialState(name)
		d.Listen(name)
		return true, ""
	}
	// case playerRejected
	return false, "Invalid login details"
}

func (d *DefaultGame) sendInitialStateFunc(playerName string) {
	d.processor.RangePlayers(func(name string, player *gs.PlayerState) {
		d.SendToAll(common.UpdateMessage{
			Type:    "newPlayer",
			Player:  name,
			Country: player.Colour,
		})

		if name == playerName {
			d.SendToPlayer(name, common.UpdateMessage{
				Troops: player.Troops,
				Type:   "updateTroops",
				Player: name,
			})
		}
	})
	d.processor.RangeCountries(func(name string, country *gs.CountryState) {
		if country.Player == "" {
			return
		}
		var msg common.UpdateMessage
		msg = common.UpdateMessage{
			Troops:  country.Troops,
			Type:    "updateCountry",
			Player:  country.Player,
			Country: name,
		}
		if country.Player == playerName && country.Troops == 0 {
			d.SendToAll(msg)
		} else {
			d.SendToPlayer(playerName, msg)
		}
	})

	if d.lobby.full {
		d.SendToPlayer(playerName, common.UpdateMessage{
			Type: "start",
		})
	} else {
		d.lobby.rangeLobby(func(player string) {
			d.SendToPlayer(playerName, common.UpdateMessage{
				Type:   "readyPlayer",
				Player: player,
			})
		})
	}
}

// Run returns the websocket handler
func (d *DefaultGame) Run() func(ctx *gin.Context) {
	// Kept this signature in case anything else needs to be done
	return func(ctx *gin.Context) {
		username, err := ctx.Cookie("username")
		if err != nil {
			redirect(ctx.Writer, ctx.Request, "No username")
			return
		}
		password, err := ctx.Cookie("password")
		if err != nil {
			redirect(ctx.Writer, ctx.Request, "No password")
			return
		}
		if added, reason := d.routePlayer(username, password, ctx); !added {
			redirect(ctx.Writer, ctx.Request, reason)
		}
	}
}

func redirect(w http.ResponseWriter, r *http.Request, msg string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	sockets.CloseWithMessage(conn, msg)
}

// AddReservation adds a player to the reserved list of the game
// This was created to handle adding players to public games but can also be used for creating tournaments
func (d *DefaultGame) AddReservation(player, password string) bool {
	if int(d.numPlayers)+len(d.lobby.reservedPlayers) == d.context.MaxPlayers {
		return false
	}
	return d.lobby.addReservation(player, password)
}

// end is used to destroy all structs associated with the game
func (d *DefaultGame) end(winner string) {
	d.Close()
	d.processor.Destroy()
	d.context.EventListener <- Event{
		ID:    d.context.ID,
		Event: PlayerLost,
		Data:  winner,
	}
	d.context.EventListener <- Event{
		ID:    d.context.ID,
		Event: Finished,
	}
}

// GetContext returns the context information
func (d *DefaultGame) GetContext() Context {
	return d.context
}
