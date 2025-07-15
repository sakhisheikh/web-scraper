package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"web-scraper/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func connectMySql() *gorm.DB {
	err := godotenv.Load()
	if err != nil {
		log.Println("Failed loading env variables. No .env file found")
	}

	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", dbUser, dbPassword, dbHost, dbPort, dbName)
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}

	err = database.AutoMigrate(&models.URLAnalysis{})
	if err != nil {
		log.Fatalf("Failed to auto migrate db %v", err)
	}

	return database
}

func main() {
	db := connectMySql()

	sampleData := []models.URLAnalysis{
		{
			URL:               "https://example.com",
			Status:            "done",
			HTMLVersion:       "HTML5",
			PageTitle:         "Example Domain",
			H1Count:           1,
			InternalLinkCount: 1,
			ExternalLinkCount: 2,
			BrokenLinks:       models.BrokenLinks{},
			HasLoginForm:      false,
		},
		{
			URL:               "https://httpstat.us/500",
			Status:            "errored",
			HTMLVersion:       "HTML5",
			PageTitle:         "500 Internal Server Error",
			H1Count:           1,
			InternalLinkCount: 0,
			ExternalLinkCount: 1,
			BrokenLinks: models.BrokenLinks{
				{URL: "https://httpstat.us/500", StatusCode: 500, ErrorMessage: "Internal Server Error"},
			},
			HasLoginForm: false,
		},
		{
			URL:               "https://go.dev",
			Status:            "queued",
			HTMLVersion:       "HTML5",
			PageTitle:         "The Go Programming Language",
			H1Count:           2,
			InternalLinkCount: 3,
			ExternalLinkCount: 5,
			BrokenLinks:       models.BrokenLinks{},
			HasLoginForm:      false,
		},
		{
			URL:               "https://non-existent-domain-123456789.com",
			Status:            "errored",
			HTMLVersion:       "HTML5",
			PageTitle:         "",
			H1Count:           0,
			InternalLinkCount: 0,
			ExternalLinkCount: 0,
			BrokenLinks: models.BrokenLinks{
				{URL: "https://non-existent-domain-123456789.com", StatusCode: 0, ErrorMessage: "Network Error"},
			},
			HasLoginForm: false,
		},
		{
			URL:               "http://localhost:8000/344",
			Status:            "done",
			HTMLVersion:       "HTML4.01",
			PageTitle:         "Test Page with Broken Links",
			H1Count:           1,
			InternalLinkCount: 1,
			ExternalLinkCount: 1,
			BrokenLinks: models.BrokenLinks{
				{URL: "http://localhost:8000/344", StatusCode: 404, ErrorMessage: "Not Found"},
			},
			HasLoginForm: true,
		},
	}

	for _, url := range sampleData {
		url.CreatedAt = time.Now()
		url.UpdatedAt = time.Now()
		if err := db.Create(&url).Error; err != nil {
			log.Printf("Failed to insert %s: %v", url.URL, err)
		} else {
			log.Printf("Seeded: %s", url.URL)
		}
	}

	log.Println("Database seeding complete.")
}
