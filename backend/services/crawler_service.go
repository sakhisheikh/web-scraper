package services

import (
	"log"
	"strings"
	"time"
	"web-scraper/models"

	"github.com/gocolly/colly/v2"
	"gorm.io/gorm"
)

var analysisQueue chan uint

const numOfWorkers = 3

func EnqueueURL(id uint) {
	analysisQueue <- id
}

func StartWorkers(db *gorm.DB) {

	if analysisQueue == nil {
		analysisQueue = make(chan uint, 100)
	}

	for i := 0; i < numOfWorkers; i++ {
		go func(workerId int) {
			for analysisID := range analysisQueue {
				CrawlAndAnalyseURL(analysisID, db)
			}
		}(i)
	}
}

func CrawlAndAnalyseURL(analysisID uint, db *gorm.DB) {
	var urlAnalysis models.URLAnalysis

	log.Println("Will crawl soon")

	if err := db.First(&urlAnalysis, analysisID).Error; err != nil {
		log.Printf("Error: couldn't find url for crawling for %d", analysisID)
	}

	// can i make sure if key is matched
	db.Model(&urlAnalysis).Update("Status", "running")

	c := colly.NewCollector(
		colly.UserAgent("url-analyser-bot/1.0"),
		colly.MaxDepth(1), //just vist one link
	)

	c.SetRequestTimeout(30 * time.Second)

	c.OnError(func(r *colly.Response, err error) {
		urlAnalysis.Status = "errored"

		// set Urlanalysis error state
		db.Save(&urlAnalysis)
	})

	c.OnHTML("html", func(e *colly.HTMLElement) {

		if strings.Contains(strings.ToLower(e.DOM.Find("html").Parent().Text()), "<!doctype html>") {
			urlAnalysis.HTMLVersion = "HTML5"
		} else {
			urlAnalysis.HTMLVersion = "HTML4"
		}

	})

	c.OnResponse(func(r *colly.Response) {
		log.Println(string(r.Body))
	})

	c.Visit(urlAnalysis.URL)

	db.Save(&urlAnalysis)

}
