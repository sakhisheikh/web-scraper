package services

import (
	"fmt"
	"log"
	netURL "net/url"
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

	var crawlError error

	c.OnError(func(r *colly.Response, err error) {
		urlAnalysis.Status = "errored"

		crawlError = fmt.Errorf("HTTP Error %d - %s", r.StatusCode, err.Error())

		log.Printf("Errored Visit onError - %v", crawlError)
	})

	c.OnHTML("title", func(e *colly.HTMLElement) {
		urlAnalysis.PageTitle = e.Text
	})

	c.OnResponse(func(r *colly.Response) {
		log.Println(string(r.Body))

		bodyString := strings.ToLower(string(r.Body))
		bodyString = strings.TrimSpace(bodyString)

		if strings.HasPrefix(bodyString, "<!doctype html>") {
			urlAnalysis.HTMLVersion = "HTML5"
		} else {
			urlAnalysis.HTMLVersion = "HTML4.01"
		}
		// could ass XHTML etc
	})

	var h1Count, h2Count, h3Count, h4Count, h5Count, h6Count int
	var externalLinksCount, internalLinksCount int

	c.OnHTML("h1", func(e *colly.HTMLElement) {
		h1Count++
	})
	c.OnHTML("h2", func(e *colly.HTMLElement) {
		h2Count++
	})

	c.OnHTML("h3", func(e *colly.HTMLElement) {
		h3Count++
	})

	c.OnHTML("h4", func(e *colly.HTMLElement) {
		h4Count++
	})

	c.OnHTML("h5", func(e *colly.HTMLElement) {
		h5Count++
	})

	c.OnHTML("h6", func(e *colly.HTMLElement) {
		h6Count++
	})

	c.OnHTML("a[href]", func(e *colly.HTMLElement) {
		link := e.Attr("href")
		absoluteUrl := e.Request.AbsoluteURL(link)

		if absoluteUrl == "" || strings.Contains(absoluteUrl, "#") || strings.HasPrefix(absoluteUrl, "javascript:") {
			return
		}

		parsedAbsoluteURL, err := netURL.Parse(absoluteUrl)
		if err != nil {
			log.Printf("parsing error for the link %v", parsedAbsoluteURL)
		}

		if parsedAbsoluteURL.Host == e.Request.URL.Host {
			internalLinksCount++
		} else {
			externalLinksCount++
		}
	})

	err := c.Visit(urlAnalysis.URL)

	if err != nil {
		if crawlError == nil {
			crawlError = fmt.Errorf("visit error %v", err)
		}
	} else {
		log.Printf("Colly visit is completed for %s - %d", urlAnalysis.URL, analysisID)
	}

	if crawlError != nil {
		urlAnalysis.Status = "errored"
	} else {
		urlAnalysis.Status = "done"
		urlAnalysis.H1Count = h1Count
		urlAnalysis.H2Count = h2Count
		urlAnalysis.H3Count = h3Count
		urlAnalysis.H4Count = h4Count
		urlAnalysis.H5Count = h5Count
		urlAnalysis.H6Count = h6Count
		urlAnalysis.InternalLinkCount = internalLinksCount
		urlAnalysis.ExternalLinkCount = externalLinksCount
	}

	result := db.Save(&urlAnalysis)
	if result.Error != nil {
		log.Printf("failed to save entry for  %s - %d - %v", urlAnalysis.URL, analysisID, result.Error)
	} else {
		log.Printf("worker is finished processing for  %s - %d - %v", urlAnalysis.URL, analysisID, urlAnalysis)
	}

}
