package game

import (
	"net/http"
	"sync/atomic"

	gs "github.com/Akshat-Tripathi/conquer2/internal/game/stateProcessors"
	"github.com/gin-gonic/gin"
	"github.com/robfig/cron"
)

//DefaultGame is a realtime game, comparable to the RealTimeGame struct of v2
type DefaultGame struct {
	situation
	*sockets
	processor  gs.StateProcessor
	context    Context
	numPlayers int32
	cron       *cron.Cron
	lobby      *lobby

	sendInitialState func(string)
}

var _ Game = (*DefaultGame)(nil)

//Init initialises a default game from a context
//PRE: ctx is valid
func (d *DefaultGame) Init(ctx Context) {
	d.context = ctx
	d.sockets = newSockets()
	d.FSM = newFSM(d.lobbyProcess, d.process)
	d.addTransitions(func() {
		d.sendToAll(UpdateMessage{
			Type: "start",
		})
		d.processor.StopAccepting()
		d.lobby.full = true
		d.cron = minuteCron(d.context.Minutes, func() {
			for player, troops := range d.processor.ProcessTroops() {
				d.sendToPlayer(player, UpdateMessage{
					Troops: troops,
					Player: player,
					Type:   "updateTroops",
				})
			}
		})
	})
	d.start()

	d.lobby = newLobby()

	d.situation = situations[ctx.Situation]

	countries := make([]string, len(d.situation.countryMap))
	i := 0
	for country := range d.situation.countryMap {
		countries[i] = country
		i++
	}
	d.processor = &gs.DefaultProcessor{}
	d.processor.Init(countries)

	maxCountries := len(countries) / ctx.MaxPlayers
	if ctx.StartingCountries > maxCountries {
		d.context.StartingCountries = maxCountries
	}

	d.sendInitialState = d.sendInitialStateFunc
}

//routePlayer will either add a new player, connect an existing player or reject the player
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
		d.newPlayer(ctx.Writer, ctx.Request, name)
		//Send initial state
		d.sendInitialState(name)

		// time.AfterFunc(d.context.StartTime.Sub(time.Now()), func() {
		d.listen(name)
		// })
		return true, ""
	}
	//case playerRejected
	return false, "Invalid login details"
}

func (d *DefaultGame) sendInitialStateFunc(playerName string) {
	d.processor.RangePlayers(func(name string, player *gs.PlayerState) {
		d.sendToAll(UpdateMessage{
			Type:    "newPlayer",
			Player:  name,
			Country: player.Colour,
		})

		if name == playerName {
			d.sendToPlayer(name, UpdateMessage{
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
		var msg UpdateMessage
		msg = UpdateMessage{
			Troops:  country.Troops,
			Type:    "updateCountry",
			Player:  country.Player,
			Country: name,
		}
		if country.Player == playerName && country.Troops == 0 {
			d.sendToAll(msg)
		} else {
			d.sendToPlayer(playerName, msg)
		}
	})

	d.lobby.rangeLobby(func(player string) {
		d.sendToPlayer(playerName, UpdateMessage{
			Type:   "readyPlayer",
			Player: player,
		})
	})
	if d.lobby.full {
		d.sendToPlayer(playerName, UpdateMessage{
			Type: "start",
		})
	}
}

//Run returns the websocket handler and starts the cron job
func (d *DefaultGame) Run() func(ctx *gin.Context) {
	d.cron.Start()
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
	closeWithMessage(conn, msg)
}

//end is used to destroy all structs associated with the game
func (d *DefaultGame) end() {
	d.close <- struct{}{}
	d.processor.Destroy()
}

//GetContext returns the context information
func (d *DefaultGame) GetContext() Context {
	return d.context
}
