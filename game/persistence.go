package game

import (
	"time"

	"cloud.google.com/go/firestore"
	"golang.org/x/net/context"
)

type persistence struct {
	docs *firestore.CollectionRef
}

func NewPersistence(id string, client *firestore.Client) *persistence {
	return &persistence{
		docs: client.Collection(id),
	}
}

func (p *persistence) load(countryStates map[string]*countryState,
	playerStates map[string]*playerState) error {
	docs, err := p.docs.DocumentRefs(context.Background()).GetAll()
	if err != nil {
		return err
	}
	for _, data := range docs {
		if data.ID != "ctx" {
			if data.ID[0] == '.' {
				pState := playerState{}
				state, err := data.Get(context.Background())
				if err != nil {
					return err
				}
				err = state.DataTo(&pState)
				if err != nil {
					return err
				}
				playerStates[data.ID[1:]] = &pState
			} else {
				cState := countryState{}
				state, err := data.Get(context.Background())
				if err != nil {
					return err
				}
				err = state.DataTo(&cState)
				if err != nil {
					return err
				}
				countryStates[data.ID] = &cState
			}
		}
	}
	return nil
}

func (p *persistence) storeContext(maxPlayerNumber int, situation string, startTime time.Time) error {
	_, err := p.docs.Doc("ctx").Set(context.Background(), struct {
		MaxPlayerNumber int
		Situation       string
		StartTime       time.Time
	}{
		MaxPlayerNumber: maxPlayerNumber,
		Situation:       situation,
		StartTime:       startTime,
	})
	return err
}

func (p *persistence) store(countryStates map[string]*countryState,
	playerStates map[string]*playerState) error {
	for country, state := range countryStates {
		if state.Player != "" {
			_, err := p.docs.Doc(country).Set(context.Background(), *state)
			if err != nil {
				return err
			}
		}
	}
	for player, state := range playerStates {
		_, err := p.docs.Doc(player).Set(context.Background(), &struct {
			Colour    string
			Troops    int
			Countries int
			Password  string
		}{
			Colour:    state.Colour,
			Troops:    state.Troops,
			Countries: state.Countries,
			Password:  state.Password,
		})
		if err != nil {
			return err
		}
	}
	return nil
}
