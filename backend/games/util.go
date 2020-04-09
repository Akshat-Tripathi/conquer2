package game

import (
	"regexp"
	"strconv"
)

//TODO - actually write this
func generateFakeName(name string) string {
	reg := regexp.MustCompile("(\\d+)(?!.*\\d)")
	num, err := strconv.Atoi(reg.FindString(name))
	if err != nil {
		return name + "1"
	}
}
