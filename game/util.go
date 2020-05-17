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
	colour    int //Maybe change this to a string
	troops    int
	countries int
	password  string
}

func sort(vals []int) []int {
	if len(vals) == 1 {
		return vals
	}
	if vals[0] < vals[1] {
		vals[0], vals[1] = vals[1], vals[0]
	}
	if len(vals) == 2 {
		return vals
	}
	if vals[2] > vals[1] {
		if vals[2] > vals[0] {
			return []int{vals[2], vals[0], vals[1]}
		}
		vals[1], vals[2] = vals[2], vals[1]
		return vals
	}
	return vals
}
