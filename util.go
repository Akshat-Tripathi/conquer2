package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
	"strings"
)

//Loads the map: Data from https://github.com/FnTm/country-neighbors
func loadMaps() map[string]map[string][]string {

	var mapTypes = []string{"world", "cold", "asia", "europe"}
	maps := make(map[string]map[string][]string)

	for _, v := range mapTypes {
		file, err := os.Open("./maps/" + v + ".txt")
		if err != nil {
			panic(err)
		}

		scanner := bufio.NewScanner(file)
		scanner.Split(bufio.ScanLines)

		worldMap := make(map[string][]string)

		var line []string

		for scanner.Scan() {
			line = strings.Split(scanner.Text(), " ")
			worldMap[line[0]] = line[1:]
		}
		maps[v] = worldMap
	}

	return maps
}

func genID() string {
	return fmt.Sprintf("%06x", rand.Intn(10000))
}
