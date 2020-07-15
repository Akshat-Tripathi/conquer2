package game

import (
	"log"
	"time"

	"cloud.google.com/go/firestore"
	"golang.org/x/net/context"
)

type persistence struct {
	docs *firestore.CollectionRef
}

func loadSnapshot(id string, docs *firestore.CollectionRef) *firestore.DocumentSnapshot {
	snapshot, err := docs.Doc(id).Get(context.Background())
	if err != nil {
		//log.Println(err)
		return nil
	}
	return snapshot
}

func (p *persistence) loadContext(ctx *Context) {
	snapshot := loadSnapshot("ctx", p.docs)
	if snapshot == nil {
		return
	}
	err := snapshot.DataTo(ctx)
	if err != nil {
		log.Println(err)
	}
}

func (p *persistence) loadPlayers(machine stateMachine) {
	snapshot := loadSnapshot("ctx", p.docs)
	if snapshot == nil {
		return
	}
	players := snapshot.Data()["Players"].([]interface{})
	//Load players
	for _, player := range players {
		stateSnapshot := loadSnapshot("."+player.(string), p.docs)
		if stateSnapshot != nil {
			data := stateSnapshot.Data()
			machine.addPlayer(
				player.(string),
				data["Password"].(string),
				data["Colour"].(string),
				int(data["Troops"].(int64)),
				int(data["Countries"].(int64)),
			)
		}
	}
}

func (p *persistence) loadCountries(machine stateMachine) {
	machine.rangeCountries(func(name string, state *countryState) {
		snapshot := loadSnapshot(name, p.docs)
		if snapshot == nil {
			return
		}
		err := snapshot.DataTo(state)
		if err != nil {
			log.Println(err)
		}
	})
}

//TODO reduce the number of things stored
func (p *persistence) storeContext(ctx Context) {
	_, err := p.docs.Doc("ctx").Set(context.Background(), getPersistentContext(ctx))
	if err != nil {
		log.Println(err)
	}
}

func (p *persistence) store(machine stateMachine) {
	machine.rangeCountries(func(country string, state *countryState) {
		if state.Player != "" {
			_, err := p.docs.Doc(country).Set(context.Background(), *state)
			if err != nil {
				log.Println(err)
			}
		}
	})

	players := make([]string, 0)
	machine.rangePlayers(func(player string, state *playerState) {
		_, err := p.docs.Doc("."+player).Set(context.Background(), *state)
		if err != nil {
			log.Println(err)
		}
		players = append(players, player)
	})

	_, err := p.docs.Doc("ctx").Set(context.Background(), map[string]interface{}{
		"Players": players,
	}, firestore.MergeAll)
	if err != nil {
		log.Println(err)
	}
}

func (p *persistence) delete() {
	if _, err := p.docs.Parent.Delete(context.Background()); err != nil {
		log.Println(err)
	}
}

type persistentContext struct {
	MaxPlayers        int
	StartingCountries int
	StartingTroops    int
	StartTime         time.Time
	Situation         string
	Minutes           int
}

func getPersistentContext(ctx Context) persistentContext {
	return persistentContext{
		MaxPlayers:        ctx.MaxPlayers,
		StartingCountries: ctx.StartingCountries,
		StartingTroops:    ctx.StartingTroops,
		StartTime:         ctx.StartTime,
		Situation:         ctx.Situation,
		Minutes:           ctx.Minutes,
	}
}
