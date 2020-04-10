package game

import (
	"regexp"
	"strconv"
)

//TODO test this
func generateFakeName(name string) string {
	reg := regexp.MustCompile(`(\d+)"*$`)
	newName := reg.ReplaceAllStringFunc(name, func(num string) string {
		n, _ := strconv.Atoi(num)
		return strconv.Itoa(n + 1)
	})
	if name == newName {
		return newName + "1"
	}
	return newName
}

type countryState struct {
	player string
	troops int
}

type playerState struct {
	colour int //Maybe change this to a string
	troops int
}
