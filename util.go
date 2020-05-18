package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
	"strings"
)

func loadMap() map[string][]string {
	file, err := os.Open("map.txt")
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

	return worldMap
}

func genID() string {
	return fmt.Sprintf("%06x", rand.Intn(10000))
}
