package main

import (
	"bufio"
	"os"
	"strings"
)

func loadMaps() map[string]map[string][]string {

	var mapTypes = []string{"world", "cold", "asia", "europe"}
	maps := make(map[string]map[string][]string)

	for _, v := range mapTypes {
		file, err := os.Open("../maps/" + v + ".txt")
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

func filter(value string, list []string) []string {
	if len(list) == 0 || !in(value, list) {
		return list
	}
	filtered := make([]string, len(list)-1)
	i := 0
	for _, v := range list {
		if v != value {
			filtered[i] = v
			i++
		}
	}
	return filtered
}

func in(value string, list []string) bool {
	for _, v := range list {
		if v == value {
			return true
		}
	}
	return false
}
