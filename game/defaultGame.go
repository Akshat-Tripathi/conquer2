package game

import (
	"net/http"
	"sync/atomic"

	"github.com/gin-gonic/gin"
)

//DefaultGame is a realtime game, comparable to the RealTimeGame struct of v2
type DefaultGame struct {
	situation
	*sockets
	machine    stateMachine
	context    Context
	numPlayers int32
}

var _ Game = (*DefaultGame)(nil)

//Init initialises a default game from a context
//PRE: ctx is valid
func (d *DefaultGame) Init(ctx Context) {
	d.context = ctx
	d.sockets = newSockets()
	d.sockets.handle = d.process
	d.situation = situations[ctx.Situation]

	countries := make([]string, len(d.situation.Map))
	i := 0
	for country := range d.situation.Map {
		countries[i] = country
		i++
	}
	d.machine = &defaultMachine{}
	d.machine.init(countries)

	maxCountries := len(countries) / ctx.MaxPlayers
	if ctx.StartingCountries > maxCountries {
		d.context.StartingCountries = maxCountries
	}
}

//RoutePlayer will either add a new player, connect an existing player or reject the player
func (d *DefaultGame) RoutePlayer(name, password string, ctx *gin.Context) (routed bool, reason string) {
	if int(d.numPlayers) == d.context.MaxPlayers {
		d.machine.stopAccepting()
	}
	switch d.machine.addPlayer(name, password, d.context.Colours[d.numPlayers],
		d.context.StartingTroops, d.context.StartingCountries) {
	case gameFull:
		return false, "Game full"
	case playerAdded:
		atomic.AddInt32(&d.numPlayers, 1)
		fallthrough
	case playerAlreadyExists:
		d.newPlayer(ctx.Writer, ctx.Request, name)
		//Send initial state
		d.sendInitialState(name)

		d.listen(name)
		return true, ""
	}
	//case playerRejected
	return false, "Invalid login details"
}

func (d *DefaultGame) sendInitialState(playerName string) {
	d.machine.rangePlayers(func(name string, player *playerState) {
		d.sockets.sendToAll(UpdateMessage{
			Type:    "newPlayer",
			Player:  name,
			Country: player.Colour,
		})
		if name == playerName {
			d.sockets.sendToPlayer(name, UpdateMessage{
				Troops: player.Troops,
				Type:   "updateTroops",
				Player: name,
			})
		}
	})
	d.machine.rangeCountries(func(name string, country *countryState) {
		var msg UpdateMessage
		msg = UpdateMessage{
			Troops:  country.Troops,
			Type:    "updateCountry",
			Player:  country.Player,
			Country: name,
		}
		if country.Player == "" {
			return
		}
		if country.Player == playerName && country.Troops == 0 {
			d.sockets.sendToAll(msg)
		} else {
			d.sockets.sendToPlayer(playerName, msg)
		}
	})
}

//Run returns the websocket handler and starts the cron job
func (d *DefaultGame) Run() func(ctx *gin.Context) {
	minuteCron(d.context.Minutes, func() {
		for player, troops := range d.machine.processTroops() {
			d.sendToPlayer(player, UpdateMessage{
				Troops: troops,
				Player: player,
				Type:   "updateTroops",
			})
		}
	}).Start()
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
		if added, reason := d.RoutePlayer(username, password, ctx); !added {
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
		valid, won, conquered, deltaSrc, deltaDest :=
			d.machine.attack(action.Src, action.Dest, name)
		if !valid {
			return
		}
		if conquered {
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  1,
				Player:  name,
				Country: action.Dest})
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  -1 - deltaSrc,
				Player:  name,
				Country: action.Src})

			if won {
				d.sendToAll(UpdateMessage{
					Type:   "won",
					Player: name,
				})
				d.End()
			}
		} else {
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaDest,
				Player:  d.machine.getOwner(action.Dest),
				Country: action.Dest})
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  deltaSrc,
				Player:  name,
				Country: action.Src})
		}
		return
	case "donate":
		if !d.machine.donate(name, action.Dest, action.Troops) {
			return
		}
		d.sendToPlayer(action.Dest, UpdateMessage{
			Type:   "updateTroops",
			Troops: action.Troops,
			Player: action.Dest,
		})
		d.sendToPlayer(name, UpdateMessage{
			Type:   "updateTroops",
			Troops: -action.Troops,
			Player: name,
		})
	case "move":
		if !d.machine.move(action.Src, action.Dest, action.Troops, name) {
			return
		}
	case "assist":
		if !d.machine.assist(action.Src, action.Dest, action.Troops, name) {
			return
		}
	case "deploy":
		if d.machine.deploy(action.Dest, action.Troops, name) {
			d.sendToPlayer(name, UpdateMessage{
				Type:   "updateTroops",
				Troops: -action.Troops,
				Player: name,
			})
			d.sendToAll(UpdateMessage{
				Type:    "updateCountry",
				Troops:  action.Troops,
				Player:  name,
				Country: action.Dest,
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
		Country: action.Src})
	d.sendToAll(UpdateMessage{
		Type:    "updateCountry",
		Troops:  action.Troops,
		Player:  d.machine.getOwner(action.Dest),
		Country: action.Dest})
}

//End is used to destroy all structs associated with the game
func (d *DefaultGame) End() {
	d.close <- struct{}{}
	d.machine.destroy()
}
