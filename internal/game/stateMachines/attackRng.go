package statemachines

import (
	"math/rand"
)

func defaultRng(srcTroops, destTroops int) (int, int) {
	if srcTroops > 3 {
		srcTroops = 3
	}
	if destTroops > 2 {
		destTroops = 2
	}

	attack := make([]int, srcTroops)
	defend := make([]int, destTroops)
	for i := 0; i < srcTroops; i++ {
		attack[i] = rand.Intn(6)
	}
	for i := 0; i < destTroops; i++ {
		defend[i] = rand.Intn(6)
	}

	attack = sort(attack)
	defend = sort(defend)

	n := srcTroops
	if destTroops < n {
		n = destTroops
	}

	srcTroops = 0
	destTroops = 0

	for i := 0; i < n; i++ {
		if attack[i] <= defend[i] {
			srcTroops--
		} else {
			destTroops--
		}
	}
	return srcTroops, destTroops
}
