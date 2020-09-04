package main

import (
	"context"
	"fmt"
	"log"
	"testing"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"github.com/Akshat-Tripathi/conquer2/internal/game"
	"github.com/go-playground/assert/v2"
	"google.golang.org/api/option"
)

var client *firestore.Client

func init() {
	auth := option.WithCredentialsFile("./internal/game/conquer2.json")
	app, err := firebase.NewApp(context.Background(), nil, auth)
	if err != nil {
		log.Println(err)
		return
	}
	if client, err = app.Firestore(context.Background()); err != nil {
		log.Println(err)
		return
	}
}

func getContext(id string) *game.Context {
	return &game.Context{
		ID:                id,
		Colours:           loadColours(),
		MaxPlayers:        5,
		Minutes:           1,
		Situation:         "world",
		StartTime:         time.Now(),
		StartingCountries: 1,
		StartingTroops:    2,
		Client:            client,
	}
}

func createSubset() *gameSubset {
	subset := newGameSubset()
	g := (game.Game)(game.NewDefaultGame(*getContext("000000")))
	g1 := (game.Game)(game.NewCapitalGame(*getContext("111111")))
	g2 := (game.Game)(game.NewCampaignGame(*getContext("222222")))
	subset.add("000000", &g)
	subset.add("111111", &g1)
	subset.add("222222", &g2)
	return subset
}

func TestAdd(t *testing.T) {
	subset := createSubset()
	assert.Equal(t, len(subset.items), 3)
}

func testRemoveHelper(id string, t *testing.T) {
	subset := createSubset()
	subset.remove(id)
	assert.Equal(t, len(subset.items), 2)
	for id1 := range subset.items {
		assert.NotEqual(t, id, id1)
	}
}

func TestRemove(t *testing.T) {
	testRemoveHelper("000000", t)
	testRemoveHelper("111111", t)
	testRemoveHelper("222222", t)
}

func TestFind(t *testing.T) {
	var player string
	const password = "hi"
	subset := createSubset()
	ids := map[string]int{"000000": 0, "111111": 0, "222222": 0}

	for i := 0; i < 3; i++ {
		for j := 0; j < 5; j++ {
			player = fmt.Sprintf("%d%d", i, j)
			ids[subset.find(player, password)]++
		}
	}
	for _, n := range ids {
		assert.Equal(t, n, 5)
	}
	assert.Equal(t, subset.find("a", password), "NOOP")
}
