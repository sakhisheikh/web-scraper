package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
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

	log.Println("Database is successfully connected")

	return database

}

func DBMiddlewareCtx(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Set("db", db)
		ctx.Next()
	}
}

func main() {
	db := ConnectMySql()

	r := gin.Default()

	r.Use(DBMiddlewareCtx(db))

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
		}

		c.JSON(http.StatusOK, gin.H{"status": "up", "db_status": "connected"})

	})

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	if err := r.Run(); err != nil {
		log.Fatalf("Failed to start the server")
	}

}
