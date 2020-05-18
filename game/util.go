package game

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

//Context - used to specify game parameters
type Context struct {
	ID                    string
	MaxPlayerNumber       int32
	StartingTroopNumber   int
	StartingCountryNumber int
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