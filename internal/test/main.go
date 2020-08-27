package main

import "fmt"

const id = "001f91"

func createAndRun(number int) {
	p := player{
		countries:     make([]string, 0),
		countryStates: make(map[string]*countryState),
		all:           make([]string, 0),
	}
	go p.join(fmt.Sprintf("Player: %d", number))
}

func main() {
	for i := 0; i < 10; i++ {
		createAndRun(i)
	}
	select {}
}
