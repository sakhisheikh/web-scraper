package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Failed loading env variables. No .env file found, relying on system environment variables.")
	} else {
		log.Println("Environment variables loaded from .env")
	}
}

func GetEnv(key string) string {
	return os.Getenv(key)
}

func GetAuth0Domain() string {
	domain := GetEnv("AUTH0_DOMAIN")
	if domain == "" {
		log.Fatal("AUTH0_DOMAIN environment variable not set.")
	}
	return domain
}

func GetAuth0Audience() string {
	audience := GetEnv("AUTH0_AUDIENCE")
	if audience == "" {
		log.Fatal("AUTH0_AUDIENCE environment variable not set.")
	}
	return audience
}
