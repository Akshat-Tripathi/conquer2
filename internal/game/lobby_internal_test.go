package game

import (
	"fmt"
	"strconv"
	"sync"
	"testing"

	"github.com/go-playground/assert/v2"
)

func TestLobbyAdd(t *testing.T) {
	l := newLobby()
	//Make sure it can't add more players if it is full
	l.full = true
	for i := 0; i < 10; i++ {
		l.add(fmt.Sprint(i))
	}
	assert.Equal(t, len(l.readyPlayers), 0)
	assert.Equal(t, l.length(), 0)

	//Make sure it can add players if it isn't full
	l.full = false
	for i := 0; i < 10; i++ {
		l.add(fmt.Sprint(i))
	}
	assert.Equal(t, len(l.readyPlayers), 10)
	assert.Equal(t, l.length(), 10)

	//Ensure that add is thread safe
	l = newLobby()
	var wg sync.WaitGroup

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func(i int) {
			l.add(fmt.Sprint(i))
			wg.Done()
		}(i)
	}
	wg.Wait()
	assert.Equal(t, len(l.readyPlayers), 1000)
	assert.Equal(t, l.length(), 1000)
}

func TestLobbyAddReservation(t *testing.T) {
	//can't make a reservation if l is full
	l := newLobby()
	l.full = true
	for i := 0; i < 10; i++ {
		assert.Equal(t, false, l.addReservation(fmt.Sprint(i), "test"))
	}
	assert.Equal(t, 0, len(l.reservedPlayers))

	//can make a reservation if l is empty
	l.full = false
	for i := 0; i < 10; i++ {
		assert.Equal(t, true, l.addReservation(fmt.Sprint(i), "test"))
	}
	assert.Equal(t, 10, len(l.reservedPlayers))

	//can't reserve someone twice
	assert.Equal(t, false, l.addReservation("0", "test"))
	assert.Equal(t, 10, len(l.reservedPlayers))

	//adding players removes reservations
	for i := 0; i < 10; i++ {
		l.add(fmt.Sprint(i))
	}
	assert.Equal(t, 0, len(l.reservedPlayers))
	assert.Equal(t, 10, len(l.readyPlayers))

	//ensure that adding reservations is thread safe
	l = newLobby()
	var wg sync.WaitGroup

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func(i int) {
			l.addReservation(fmt.Sprint(i), "test")
			wg.Done()
		}(i)
	}
	wg.Wait()
	assert.Equal(t, len(l.reservedPlayers), 1000)
}

func TestRangeLobby(t *testing.T) {
	l := newLobby()
	max := 0
	for i := 0; i < 1000; i++ {
		l.add(fmt.Sprint(i))
		max += i
	}
	var wg sync.WaitGroup
	counter := func() func(string) {
		count := 0
		return func(s string) {
			//s represents an int
			n, err := strconv.Atoi(s)
			if err != nil {
				t.FailNow()
			}
			count += n
			if count == max {
				wg.Done()
			}
		}
	}

	for i := 0; i < 100; i++ {
		wg.Add(1)
		go l.rangeLobby(counter())
	}
	wg.Wait()
}
