package game

import (
	"net/http"
	"sync/atomic"
	"time"

	st "github.com/Akshat-Tripathi/conquer2/internal/game/stateMachines"
	"github.com/gin-gonic/gin"
	"github.com/robfig/cron"
)

//DefaultGame is a realtime game, comparable to the RealTimeGame struct of v2
type DefaultGame struct {
	situation
	*sockets
	machine    st.StateMachine
	context    Context
	numPlayers int32
	cron       *cron.Cron

	sendInitialState func(string)
}

var _ Game = (*DefaultGame)(nil)

//Init initialises a default game from a context
//PRE: ctx is valid
func (d *DefaultGame) Init(ctx Context) {
	d.context = ctx
	d.sockets = newSockets()
	d.handle = d.process
	d.cron = minuteCron(d.context.Minutes, func() {
		for player, troops := range d.machine.ProcessTroops() {
			d.sendToPlayer(player, UpdateMessage{
				Troops: troops,
				Player: player,
				Type:   "updateTroops",
			})
		}
	})
	d.situation = situations[ctx.Situation]

	countries := make([]string, len(d.situation.countryMap))
	i := 0
	for country := range d.situation.countryMap {
		countries[i] = country
		i++
	}
	d.machine = &st.DefaultMachine{}
	d.machine.Init(countries)

	maxCountries := len(countries) / ctx.MaxPlayers
	if ctx.StartingCountries > maxCountries {
		d.context.StartingCountries = maxCountries
	}

	d.sendInitialState = d.sendInitialStateFunc
}

//routePlayer will either add a new player, connect an existing player or reject the player
func (d *DefaultGame) routePlayer(name, password string, ctx *gin.Context) (routed bool, reason string) {
	if int(d.numPlayers) == d.context.MaxPlayers {
		d.machine.StopAccepting()
	}
	switch d.machine.AddPlayer(name, password, d.context.Colours[d.numPlayers],
		d.context.StartingTroops, d.context.StartingCountries) {
	case st.GameFull:
		return false, "Game full"
	case st.PlayerAdded:
		atomic.AddInt32(&d.numPlayers, 1)
		fallthrough
	case st.PlayerAlreadyExists:
		d.newPlayer(ctx.Writer, ctx.Request, name)
		//Send initial state
		d.sendInitialState(name)

		time.AfterFunc(d.context.StartTime.Sub(time.Now()), func() {
			d.listen(name)
		})
		return true, ""
	}
	//case playerRejected
	return false, "Invalid login details"
}

func (d *DefaultGame) sendInitialStateFunc(playerName string) {
	d.machine.RangePlayers(func(name string, player *st.PlayerState) {
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
	d.machine.RangeCountries(func(name string, country *st.CountryState) {
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

func (d *DefaultGame) process(name string, action Action) {
	switch action.ActionType {
	case "attack":
		if !d.areNeighbours(action.Src, action.Dest) {
			return
		}
		valid, won, conquered, deltaSrc, deltaDest :=
			d.machine.Attack(action.Src, action.Dest, name, action.Troops)
		if !valid {
			return
		}
		if conquered {
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  1,
				Player:  name,
				Country: action.Dest,
				ID:      1,
			})
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaSrc - 1,
				Player:  name,
				Country: action.Src,
				ID:      2,
			})

			if won {
				d.sendToAll(UpdateMessage{
					Type:   "won",
					Player: name,
				})
				time.AfterFunc(time.Second*5, d.end)
			}
		} else {
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaDest,
				Player:  d.machine.GetCountry(action.Dest).Player,
				Country: action.Dest,
				ID:      3,
			})
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaSrc,
				Player:  name,
				Country: action.Src,
				ID:      4,
			})
		}
		return
	case "donate":
		if !d.machine.Donate(name, action.Dest, action.Troops) {
			return
		}
		d.sendToPlayer(action.Dest, UpdateMessage{
			Type:   "updateTroops",
			Troops: action.Troops,
			Player: action.Dest,
			ID:     5,
		})
		d.sendToPlayer(name, UpdateMessage{
			Type:   "updateTroops",
			Troops: -action.Troops,
			Player: name,
			ID:     6,
		})
	case "move":
		if !d.areNeighbours(action.Src, action.Dest) {
			return
		}
		if !d.machine.Move(action.Src, action.Dest, action.Troops, name) {
			return
		}
	case "assist":
		if !d.areNeighbours(action.Src, action.Dest) {
			return
		}
		if !d.machine.Assist(action.Src, action.Dest, action.Troops, name) {
			return
		}
	case "deploy":
		if d.machine.Deploy(action.Dest, action.Troops, name) {
			d.sendToPlayer(name, UpdateMessage{
				Type:   "updateTroops",
				Troops: -action.Troops,
				Player: name,
				ID:     7,
			})
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  action.Troops,
				Player:  name,
				Country: action.Dest,
				ID:      8,
			})
		}
		return
	default:
		return
	}
	d.sendToAll(UpdateMessage{
		Type:    "updateCountry",
		Troops:  -action.Troops,
		Player:  name,
		Country: action.Src,
		ID:      9,
	})
	d.sendToAll(UpdateMessage{
		Type:    "updateCountry",
		Troops:  action.Troops,
		Player:  d.machine.GetCountry(action.Dest).Player,
		Country: action.Dest,
		ID:      10,
	})
}

//end is used to destroy all structs associated with the game
func (d *DefaultGame) end() {
	d.close <- struct{}{}
	d.machine.Destroy()
}

//GetContext returns the context information
func (d *DefaultGame) GetContext() Context {
	return d.context
}
