package stateprocessors

import (
	"math/rand"
)

func defaultRng(srcTroops, destTroops, times int) (int, int) {
	var tempSrc, tempDest, deltaSrc, deltaDest int
	for times > 0 && deltaSrc+srcTroops > 0 && deltaDest+destTroops > 0 {
		tempSrc, tempDest = defaultRngHelper(srcTroops, destTroops)
		deltaSrc += tempSrc
		deltaDest += tempDest
		times--
	}
	if deltaSrc+srcTroops < 0 {
		deltaSrc = -srcTroops
	}
	return deltaSrc, deltaDest
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
