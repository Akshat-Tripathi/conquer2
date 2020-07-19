package game

import (
	"bufio"
	"os"
	"strings"
)

var situations = make(map[string]situation)

func init() {
	loadSituations()
}

//situation provides wrappers for different world maps
type situation struct {
	countryMap map[string][]string
}

//loadSituations data from https://github.com/FnTm/country-neighbors
func loadSituations() {
	var mapTypes = []string{"world", "cold", "asia", "europe"}

	for _, v := range mapTypes {
		file, err := os.Open("./maps/" + v + ".txt")
		if err != nil {
			panic(err)
		}

		scanner := bufio.NewScanner(file)
		scanner.Split(bufio.ScanLines)

		worldMap := situation{
			countryMap: make(map[string][]string),
		}

		var line []string

		for scanner.Scan() {
			line = strings.Split(scanner.Text(), " ")
			worldMap.countryMap[line[0]] = line[1:]
		}
		situations[v] = worldMap
	}
}

//PRE: src is a valid country
func (s situation) areNeighbours(src, dest string) bool {
	for _, neighbour := range s.countryMap[src] {
		if neighbour == dest {
			return true
		}
	}
	return false
}

//PRE: country is valid
func (s situation) getNeighbours(country string) []string {
	return s.countryMap[country]
}
