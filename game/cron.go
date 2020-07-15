package game

import (
	"fmt"
	"time"

	"github.com/robfig/cron"
)

func minuteCron(minutes int, job func()) *cron.Cron {
	c := cron.New()
	if c.AddFunc(fmt.Sprintf("*/%d * * * *", minutes*60), job) != nil {
		return nil
	}
	return c
}

func tripleCron(job func()) *cron.Cron {
	c := cron.New()
	if c.AddFunc("*/0 0,8,16 * * *", job) != nil {
		return nil
	}
	return c
}

func waitUntilStart(start time.Time) {
	time.Sleep(start.Sub(time.Now()))
}
