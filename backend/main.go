package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	authMiddleware "web-scraper/middlewares"
	"web-scraper/models"
	"web-scraper/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func ConnectMySql() *gorm.DB {
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
		log.Fatalf("Failed to connect to DB")
	}

	err = database.AutoMigrate(&models.URLAnalysis{})

	if err != nil {
		log.Fatalf("Failed to auto migrate db %v", err)
	}

	log.Println("Database is successfully connected")

	return database

}

func DBMiddlewareCtx(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Set("db", db)
		ctx.Next()
	}
}

type AddURLInput struct {
	URL string `json:"url" binding:"required,url"`
}

func AddURL(c *gin.Context) {
	dbInstance, exists := c.Get("db")

	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database instance not found"})
		return
	}

	db := dbInstance.(*gorm.DB)

	var input AddURLInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	input.URL = strings.TrimSpace(input.URL)

	if input.URL == "" { // Check if it became empty after trimming, that leads to 500 otherwise
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL cannot be empty or just whitespace"})
		return
	}

	urlAnalysis := models.URLAnalysis{URL: input.URL, Status: "queued"}

	result := db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "url"}},
		DoUpdates: clause.Assignments(map[string]interface{}{
			"status":     "queued",
			"updated_at": gorm.Expr("NOW()"),
		}),
	}).Create(&urlAnalysis)

	if result.Error != nil {
		//todo: error for duplicate url creation
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add URL: " + result.Error.Error()})
		return
	}

	services.EnqueueURL(urlAnalysis.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Url has been added",
		"id":      urlAnalysis.ID,
		"url":     urlAnalysis.URL,
		"status":  urlAnalysis.Status,
	})
}

func GetAllURLs(c *gin.Context) {
	dbInstance, exists := c.Get("db")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database instance not found"})
		return
	}

	db := dbInstance.(*gorm.DB)

	urls := []models.URLAnalysis{}

	if err := db.Find(&urls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch urls " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"urls": urls})

}

func GetUrlByID(c *gin.Context) {
	dbInstance, exists := c.Get("db")

	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database instance not found"})
		return
	}

	db := dbInstance.(*gorm.DB)

	idParam := c.Param("id")

	id, err := strconv.ParseInt(idParam, 10, 64) // base 10, 64-bit integer
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID format"})
		return
	}

	urlAnalysis := models.URLAnalysis{}

	result := db.First(&urlAnalysis, id)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "could not find the record for"})

		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch URL: " + result.Error.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, urlAnalysis)
}

func CancelUrl(c *gin.Context) {
	dbInstance, exists := c.Get("db")

	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database instance not found"})
		return
	}

	db := dbInstance.(*gorm.DB)

	idParam := c.Param("id")

	id, err := strconv.ParseInt(idParam, 10, 64) // base 10, 64-bit integer
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID format"})
		return
	}

	var urlAnalysis models.URLAnalysis
	result := db.First(&urlAnalysis, id)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "URL analysis not found"})
		} else {
			log.Printf("Error [CancelURL]: Failed to fetch URL %d for cancel: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch URL for cancel: " + result.Error.Error()})
		}
		return
	}

	// Check if it's already in a final state
	if urlAnalysis.Status == "done" || urlAnalysis.Status == "error" || urlAnalysis.Status == "cancelled" {
		c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("URL analysis is already %s. Cannot cancel.", urlAnalysis.Status)})
		return
	}

	updateResult := db.Model(&urlAnalysis).Updates(map[string]interface{}{
		"status":     "cancelled",
		"updated_at": gorm.Expr("NOW()"),
	})

	if updateResult.Error != nil {
		log.Printf("Error [CancelURL]: Failed to cancel URL analysis %d: %v", id, updateResult.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel URL analysis: " + updateResult.Error.Error()})
		return
	}

	if cancel, ok := services.RunningCrawlContexts.Load(urlAnalysis.ID); ok {
		// We found a cancel function for this running job
		cancel.(context.CancelFunc)()
		services.RunningCrawlContexts.Delete(urlAnalysis.ID)
		log.Printf("Triggered cancellation for running URLAnalysis ID: %d", urlAnalysis.ID)
	} else {
		// Job was likely queued or paused, not actively running at the moment
		log.Printf("URLAnalysis ID: %d was not actively running, only status updated to 'cancelled'.", urlAnalysis.ID)
	}

	c.JSON(http.StatusOK, gin.H{"message": "URL analysis cancelled successfully", "id": urlAnalysis.ID, "status": "cancelled"})

}

func main() {
	db := ConnectMySql()

	r := gin.Default()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	r.RedirectTrailingSlash = false

	// allow cors for frontend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// so we don't need pass db or store it as global variable
	r.Use(DBMiddlewareCtx(db))

	// to be able to process more than one URL
	services.StartWorkers(db)

	r.GET("/health", func(c *gin.Context) {

		dbInstance, exists := c.Get("db")

		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "down", "db_error": "Database connection not found in context"})
		}

		myDB := dbInstance.(*gorm.DB)
		sqlDB, err := myDB.DB()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "down", "db_error": "Internal type assertion error for DB"})
			log.Fatalf("Value in context for key 'db' was not of type *gorm.DB")
			return
		}

		if err := sqlDB.Ping(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "down", "db_error": "DB Ping failed" + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": "up", "db_status": "connected"})

	})

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	urlGroup := r.Group("/urls")
	// Add authenticaion middleware using auth0
	urlGroup.Use(authMiddleware.EnsureAuthenitcation())
	{
		urlGroup.POST("", AddURL)
		urlGroup.GET("", GetAllURLs)
		urlGroup.GET("/:id", GetUrlByID)
	}

	if err := r.Run(); err != nil {
		log.Fatalf("Failed to start the server")
	}

}
