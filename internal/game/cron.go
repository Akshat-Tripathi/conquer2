package game

import (
	"fmt"
	"time"

	"github.com/robfig/cron"
)

func minuteCron(minutes int, job func()) *cron.Cron {
	c := cron.New()
	if c.AddFunc(fmt.Sprintf("@every %dm", minutes), job) != nil {
		return nil
	}
	return c
}

func tripleCron(startTime time.Time, job func()) *cron.Cron {
	c := cron.New()
	if c.AddFunc("0 0 0,8,16 * * *", func() {
		time.AfterFunc(startTime.Sub(time.Now()), job)
	}) != nil {
		return nil
	}
	return c
}

func eraCron(c *cron.Cron, startTime time.Time, job1, job2 func()) {
	attackDate := startTime.AddDate(0, 0, 2)
	endDate := startTime.AddDate(0, 0, 14)
	c.AddFunc(fmt.Sprintf("0 0 0 %d %d *", attackDate.Day(), attackDate.Month()), job1)
	c.AddFunc(fmt.Sprintf("0 0 0 %d %d *", endDate.Day(), endDate.Month()), job2)
}
