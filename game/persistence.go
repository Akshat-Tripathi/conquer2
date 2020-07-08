package game

import (
	"fmt"

	"cloud.google.com/go/firestore"
	"golang.org/x/net/context"
)

type persistence struct {
	docs *firestore.CollectionRef
}

func newPersistence(id string, client *firestore.Client) *persistence {
	return &persistence{
		docs: client.Collection(id),
	}
}

func (p *persistence) load(countryStates map[string]*countryState) error {
	docs, err := p.docs.DocumentRefs(context.Background()).GetAll()
	if err != nil {
		return err
	}
	for _, data := range docs {
		cState := countryState{}
		state, err := data.Get(context.Background())
		if err != nil {
			return err
		}
		fmt.Println(state.Data())
		err = state.DataTo(&cState)
		if err != nil {
			return err
		}
		countryStates[data.ID] = &cState
	}
	return nil
}

func (p *persistence) store(countryStates map[string]*countryState) error {
	for country, state := range countryStates {
		_, err := p.docs.Doc(country).Set(context.Background(), *state)
		if err != nil {
			return err
		}
	}
	return nil
}
