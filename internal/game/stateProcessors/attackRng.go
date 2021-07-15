package stateprocessors

import (
	"math/rand"
)

//POST: deltaSrc won't exceed the number of troops in the src country
func defaultRng(srcTroops, destTroops, times int) (int, int) {
	var deltaSrc, deltaDest int
	tempSrc, tempDest := srcTroops, destTroops
	for times > 0 && tempSrc > 0 && tempDest > 0 {
		deltaSrc, deltaDest = defaultRngHelper(tempSrc, tempDest)
		tempSrc += deltaSrc
		tempDest += deltaDest
		times--
	}
	if tempSrc < 0 {
		tempSrc = 0
	}
	return tempSrc - srcTroops, tempDest - destTroops
}

func defaultRngHelper(srcTroops, destTroops int) (int, int) {
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

	destTroops = destTroops - srcTroops
	srcTroops = 0

	for i := 0; i < n; i++ {
		if attack[i] <= defend[i] {
			srcTroops--
		} else {
			destTroops--
		}
	}
	return srcTroops, destTroops
}
