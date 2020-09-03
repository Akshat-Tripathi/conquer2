package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
	"time"
)

func loadColours() []string {
	file, err := os.Open("./colours.txt")
	if err != nil {
		panic(err)
	}
	scanner := bufio.NewScanner(file)
	scanner.Split(bufio.ScanLines)

	cols := make([]string, 20)
	i := 0
	for scanner.Scan() {
		cols[i] = scanner.Text()
		i++
	}
	return cols
}

func genID() string {
	return fmt.Sprintf("%06x", rand.Intn(10000))
}

func shuffle(strs []string) []string {
	rand.Seed(time.Now().UnixNano())
	shuffled := make([]string, len(strs))
	for i, j := range rand.Perm(len(strs)) {
		shuffled[i] = strs[j]
	}
	return shuffled
}
