package game

import (
	"bytes"
	"context"
	"io/ioutil"

	"cloud.google.com/go/firestore"
)

func connect() *firestore.Client {
	file, err := ioutil.ReadFile("./game/fire.key")
	if err != nil {
		panic("No key provided")
	}
	tokens := bytes.Split(file, []byte{'\n'})
	client, err := firestore.NewClient(context.Background(), string(tokens[0]))
	if err != nil {
		panic(err)
	}
	return client
}

type firebase struct {
	ref *firestore.CollectionRef
}

//loads only countries which exist in the firebase - ie those which have been updated
func (f *firebase) load(countryStates map[string]*countryState) {
	states, err := f.ref.Doc("state").Get(context.Background())
	if err != nil {
		return
	}
	for country, state := range states.Data() {
		countryStates[country] = state.(*countryState)
	}
}

//Stores all countries which have a player or troops
func (f *firebase) store(countryStates map[string]*countryState) {
	for country, state := range countryStates {
		f.ref.Doc("state/"+country).Set(context.Background(), *state, firestore.MergeAll)
	}
}

func Main() {
	m := make(map[string]*countryState)
	m["a"] = &countryState{
		player: "me",
		troops: 4,
	}
	client := connect()
	f := &firebase{client.Collection("lol")}
	f.store(m)
}
