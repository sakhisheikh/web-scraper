package services

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	netURL "net/url"
	"strings"
	"sync"
	"time"
	"web-scraper/models"

	"github.com/gocolly/colly/v2"
	"gorm.io/gorm"
)

// to cancel a crawl process
var RunningCrawlContexts sync.Map
var analysisQueue chan uint

const numOfWorkers = 3

func EnqueueURL(id uint) {
	analysisQueue <- id
}

func StartWorkers(db *gorm.DB) {

	if analysisQueue == nil {
		analysisQueue = make(chan uint, 100)
	}

	for i := range numOfWorkers {
		go func(workerId int) {
			for analysisID := range analysisQueue {

				ctx, cancel := context.WithCancel(context.Background())

				log.Printf("Worker %d: Registered context for ID %d.", workerId, analysisID)
				RunningCrawlContexts.Store(analysisID, cancel)

				CrawlAndAnalyseURL(ctx, analysisID, db)

				cancel()
				RunningCrawlContexts.Delete(analysisID)
				log.Printf("Worker %d: Unregistered context for ID %d.", workerId, analysisID)
			}

		}(i)
	}
}

func CrawlAndAnalyseURL(ctx context.Context, analysisID uint, db *gorm.DB) {
	var urlAnalysis models.URLAnalysis

	log.Println("Will crawl soon")

	if err := db.First(&urlAnalysis, analysisID).Error; err != nil {
		log.Printf("Error: couldn't find url for crawling for %d", analysisID)
	}

	select {
	case <-ctx.Done(): // Context already canceled before starting
		log.Printf("Worker processing URLAnalysis ID: %d - URL: %s was CANCELLED before starting crawl (context done). Status set to cancelled.", analysisID, urlAnalysis.URL)
		db.Model(&urlAnalysis).Updates(map[string]interface{}{"status": "cancelled", "updated_at": gorm.Expr("NOW()")})
		return
	default: // Context not done yet, proceed
	}

	if urlAnalysis.Status == "cancelled" { // Defensive check, if DB status was cancelled externally
		log.Printf("Worker processing URLAnalysis ID: %d - URL: %s is CANCELLED (DB status). Skipping crawl.", analysisID, urlAnalysis.URL)
		return
	}

	// todo: can i make sure if key is matched
	db.Model(&urlAnalysis).Update("Status", "running")

	c := colly.NewCollector(
		colly.UserAgent("url-analyser-bot/1.0"),
		colly.MaxDepth(1), //just vist one link
	)

	c.SetRequestTimeout(30 * time.Second)

	// create context aware colly client to cancel crawl requests
	transport := &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		DialContext: (&net.Dialer{
			Timeout:   30 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		TLSHandshakeTimeout: 10 * time.Second,
	}
	httpClientColly := &http.Client{
		Transport: transport,
		Timeout:   30 * time.Second,
	}
	c.SetClient(httpClientColly)

	var crawlError error

	c.OnError(func(r *colly.Response, err error) {
		urlAnalysis.Status = "errored"

		crawlError = fmt.Errorf("HTTP Error %d - %s", r.StatusCode, err.Error())

		log.Printf("Errored Visit onError - %v", crawlError)
	})

	// refactor to initialize it for update again other the db retains the previous value

	c.OnHTML("title", func(e *colly.HTMLElement) {
		urlAnalysis.PageTitle = e.Text
	})

	c.OnResponse(func(r *colly.Response) {
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
	var allLinks []string
	var hasLoginForm bool

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
		// could be a channel too to enable stream processing of links like as soon as you found one link starts processing
		allLinks = append(allLinks, absoluteUrl)
	})

	c.OnHTML("form:has(input[type=password]), form:has(input[name=password])", func(h *colly.HTMLElement) {
		// it could miss modern browser login where first you have to enter only email/username e.g disneyplus login form
		hasLoginForm = true
	})

	err := c.Visit(urlAnalysis.URL)

	if err != nil {
		if crawlError == nil {
			crawlError = fmt.Errorf("visit error %v", err)
		}
	} else {
		log.Printf("Colly visit is completed for %s - %d", urlAnalysis.URL, analysisID)
	}

	var brokenLinks []models.BrokenLink = []models.BrokenLink{}
	var inaccessibleLinksCount int
	if crawlError == nil {
		brokenLinks, inaccessibleLinksCount = checkLinks(ctx, allLinks)

	}

	select {
	case <-ctx.Done():
		log.Printf("Worker processing URLAnalysis ID: %d - URL: %s was CANCELLED during crawl or before final save (context done).", analysisID, urlAnalysis.URL)
		urlAnalysis.Status = "cancelled"
		urlAnalysis.PageTitle = "Crawl cancelled." // Provide a clear title for cancelled state
		urlAnalysis.BrokenLinks = []models.BrokenLink{}
	default:
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
			urlAnalysis.HasLoginForm = hasLoginForm
			urlAnalysis.InternalLinkCount = internalLinksCount
			urlAnalysis.ExternalLinkCount = externalLinksCount
			urlAnalysis.InaccessibleLinkCount = inaccessibleLinksCount
			urlAnalysis.BrokenLinks = brokenLinks
		}
	}

	result := db.Select("*").Save(&urlAnalysis)
	if result.Error != nil {
		log.Printf("failed to save entry for  %s - %d - %v", urlAnalysis.URL, analysisID, result.Error)
	} else {
		log.Printf("worker is finished processing for  %s - %d - %v", urlAnalysis.URL, analysisID, urlAnalysis)
	}

}

func checkLinks(ctx context.Context, links []string) ([]models.BrokenLink, int) {

	if len(links) == 0 {
		return []models.BrokenLink{}, 0
	}

	select {
	case <-ctx.Done():
		log.Printf("Context cancelled before starting link checks: %v", ctx.Err())
		return []models.BrokenLink{}, 0
	default:
	}

	linksToCheck := make(chan string, len(links))
	brokenLinksChan := make(chan models.BrokenLink, len(links))

	var wg sync.WaitGroup

	var linksCheckerWorkers = 20

	httpClient := &http.Client{
		Timeout: 5 * time.Second,
	}

	for range linksCheckerWorkers {

		wg.Add(1)

		go func() {
			defer wg.Done()
			for link := range linksToCheck {
				func(currentLink string) {

					select {
					case <-ctx.Done():
						log.Printf("Worker: Context cancelled while checking links. Skipping remaining links.")
						return // Stop this worker goroutine
					default:
					}
					resp, err := httpClient.Head(currentLink)

					if err != nil {
						brokenLinksChan <- models.BrokenLink{
							ErrorMessage: err.Error(),
							StatusCode:   0,
							URL:          currentLink,
						}
						return
					}

					defer resp.Body.Close()

					if resp.StatusCode >= 400 {
						brokenLinksChan <- models.BrokenLink{
							StatusCode:   resp.StatusCode,
							ErrorMessage: http.StatusText(resp.StatusCode),
							URL:          currentLink,
						}
					}

				}(link)
			}

		}()
	}

	for _, link := range links {
		linksToCheck <- link
	}

	close(linksToCheck)

	wg.Wait()

	close(brokenLinksChan)

	var collectedBrokenLinks []models.BrokenLink = []models.BrokenLink{}
	var inaccessibleLinksCount int
	for bl := range brokenLinksChan {
		collectedBrokenLinks = append(collectedBrokenLinks, bl)
		inaccessibleLinksCount++
	}

	return collectedBrokenLinks, inaccessibleLinksCount

}
