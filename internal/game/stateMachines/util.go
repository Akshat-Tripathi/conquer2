package statemachines

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
