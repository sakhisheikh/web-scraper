package services

import "log"

var analysisQueue chan uint

const numOfWorkers = 3

func EnqueueURL(id uint) {
	analysisQueue <- id
}

func StartWorkers() {

	if analysisQueue == nil {
		analysisQueue = make(chan uint, 100)
	}

	for i := 0; i < numOfWorkers; i++ {
		go func(workerId int) {
			for analysisID := range analysisQueue {
				CrawlAndAnalyseURL(analysisID)
			}
		}(i)
	}
}

func CrawlAndAnalyseURL(analysisID uint) {

	log.Println("Will crawl soon")

}
