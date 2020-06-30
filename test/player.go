package main

import (
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"time"

	"github.com/gorilla/websocket"
)

var (
	countries map[string]map[string][]string = loadMaps()
)

type action struct {
	Troops     int
	ActionType string
	Src        string
	Dest       string
	Player     string
}

type updateMessage struct {
	Troops  int    //delta troops
	Type    string //Type of update: updateCountry or updateTroops or newPlayer
	Player  string //Player that owns the country / dest player
	Country string //Could be the colour iff the type is newPlayer
}

type countryState struct {
	troops int
	player string
}

type player struct {
	name          string
	baseTroops    int
	countries     []string
	countryStates map[string]*countryState
	conn          *websocket.Conn
	all           []string
}

//Attempts to dial the ip, returns whether it was successful
func (p *player) connect(ip, username string) bool {
	dialer := websocket.Dialer{}
	var err error
	header := make(http.Header)
	header.Set("Cookie", fmt.Sprintf("situation=world; id=test; username=%s; password=asdf;",
		username))
	p.conn, _, err = dialer.Dial(ip, header)
	return err == nil
}

//Is the same as socket.onMessage in the js
func (p *player) onMessage(stop *bool) {
	var msg updateMessage
	for {
		err := p.conn.ReadJSON(&msg)
		if err != nil {
			*stop = true
			return
		}
		switch msg.Type {
		case "updateTroops":
			p.name = msg.Player
			p.baseTroops += msg.Troops
		case "updateCountry":
			country, ok := p.countryStates[msg.Country]
			if !ok || country.player != msg.Player {
				if p.name == msg.Player {
					p.countries = append(p.countries, msg.Country)
				}
				if ok && p.countryStates[msg.Country].player == p.name {
					//Remove country from my countries
					p.countries = filter(msg.Country, p.countries)
				}
				p.countryStates[msg.Country] = &countryState{msg.Troops, msg.Player}
			} else {
				p.countryStates[msg.Country].troops += msg.Troops
			}
		case "newPlayer":
			if !in(msg.Player, p.all) {
				p.all = append(p.all, msg.Player)
			}
		}
	}
}

func (p *player) selectCountries() (string, string) {
	fromCountry := p.countries[rand.Intn(len(p.countries))]
	neighbours := countries["world"][fromCountry]
	toCountry := neighbours[rand.Intn(len(neighbours))]
	return fromCountry, toCountry
}

func (p *player) selectPlayer() string {
	var other string
	for ok := true; ok; ok = other != p.name {
		other = p.all[rand.Intn(len(p.all))]
	}
	return other
}

func (p *player) attack(fromCountry, toCountry string) {
	p.conn.WriteJSON(action{
		Troops:     0,
		ActionType: "attack",
		Src:        fromCountry,
		Dest:       toCountry,
		Player:     p.name,
	})
}

func (p *player) donate() {
	p.conn.WriteJSON(action{
		Troops:     rand.Intn(p.baseTroops + 1),
		ActionType: "donate",
		Src:        "",
		Dest:       p.selectPlayer(),
		Player:     p.name,
	})
}

func (p *player) move(fromCountry, toCountry string) {
	p.conn.WriteJSON(action{
		Troops:     rand.Intn(p.baseTroops + 1),
		ActionType: "move",
		Src:        fromCountry,
		Dest:       toCountry,
		Player:     p.name,
	})
}

func (p *player) deploy(fromCountry string) {
	act := action{
		Troops:     rand.Intn(p.baseTroops + 1),
		ActionType: "drop",
		Src:        "",
		Dest:       fromCountry,
		Player:     p.name,
	}
	p.conn.WriteJSON(act)
}

//Run - runs the player
func (p *player) run(ip, username string) {
	if !p.connect(ip, username) {
		return
	}
	stop := false
	go p.onMessage(&stop)

	var fromCountry, toCountry string

	for !stop {
		if len(p.countries) > 0 && len(p.all) > 0 {
			fromCountry, toCountry = p.selectCountries()
			if p.countryStates[fromCountry].troops > 0 {
				if p.countryStates[toCountry].player == p.name {
					p.move(fromCountry, toCountry)
				} else {
					p.attack(fromCountry, toCountry)
				}
			} else {
				if rand.Intn(2) == 0 {
					p.deploy(fromCountry)
				} else {
					p.donate()
				}
			}
			time.Sleep(time.Millisecond * time.Duration(rand.Intn(3)) * 500)
		}
	}
}

//Join - joins a game and starts the player
func (p *player) Join(name string) {
	p.name = name

	v := url.Values{}
	v.Set("username", name)
	v.Set("password", "asdf")
	v.Set("id", "test")

	_, err := http.PostForm("http://localhost/join", v)

	if err != nil {
		panic(err)
	}

	time.Sleep(time.Second * 5)
	p.run("ws://localhost/game/test/ws", name)
}
