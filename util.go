package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
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
