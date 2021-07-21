package game

import (
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/firestore"
	gs "github.com/Akshat-Tripathi/conquer2/internal/game/stateProcessors"
	"golang.org/x/net/context"
)

type persistence struct {
	docs *firestore.CollectionRef
}

func loadSnapshot(id string, docs *firestore.CollectionRef) *firestore.DocumentSnapshot {
	snapshot, err := docs.Doc(id).Get(context.Background())
	if err != nil {
		// log.Println(err)
		return nil
	}
	return snapshot
}

func (p *persistence) loadContext(ctx *Context) bool {
	snapshot := loadSnapshot("ctx", p.docs)
	if snapshot == nil {
		log.Println("No context found")
		return false
	}
	err := snapshot.DataTo(ctx)
	if err != nil {
		log.Println(err)
		return false
	}
	return true
}

func (p *persistence) loadPlayers(processor gs.StateProcessor) int {
	snapshot := loadSnapshot("ctx", p.docs)
	if snapshot == nil {
		return 0
	}
	players := snapshot.Data()["Players"].([]interface{})
	playerCountries := make(map[string]int)

	// Load players
	for _, player := range players {
		stateSnapshot := loadSnapshot("."+player.(string), p.docs)
		if stateSnapshot != nil {
			data := stateSnapshot.Data()
			processor.AddPlayer(
				player.(string),
				data["Password"].(string),
				data["Colour"].(string),
				int(data["Troops"].(int64)),
				0,
			)
			playerCountries[player.(string)] = int(data["Countries"].(int64))
		}
	}
	processor.RangePlayers(func(name string, player *gs.PlayerState) {
		countries, ok := playerCountries[name]
		if !ok {
			return
		}
		player.Countries = countries
	})

	// Calculate number of updates missed
	fmt.Println(snapshot.UpdateTime.Local())
	missedUpdates := int(time.Now().Sub(snapshot.UpdateTime).Hours() / 1)
	for i := 0; i < missedUpdates; i++ {
		processor.ProcessTroops()
	}
	return len(players)
}

func (p *persistence) loadCountries(processor gs.StateProcessor) {
	processor.RangeCountries(func(name string, state *gs.CountryState) {
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

func (p *persistence) storeContext(ctx Context) {
	_, err := p.docs.Doc("ctx").Set(context.Background(), getPersistentContext(ctx))
	if err != nil {
		log.Println(err)
	}
}

func (p *persistence) store(processor gs.StateProcessor) {
	processor.RangeCountries(func(country string, state *gs.CountryState) {
		if state.Player != "" {
			_, err := p.docs.Doc(country).Set(context.Background(), *state)
			if err != nil {
				log.Println(err)
			}
		}
	})

	players := make([]string, 0)
	processor.RangePlayers(func(player string, state *gs.PlayerState) {
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
