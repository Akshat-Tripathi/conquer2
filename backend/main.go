package main

import "fmt"

var (
	neighbours = loadMap()
)

func main() {
	fmt.Println(neighbours["A"])
}
