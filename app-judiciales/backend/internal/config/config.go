package config

import (
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	// Server Configuration
	Port        string
	Environment string

	// Database Configuration
	MongoDBURI      string
	MongoDBDatabase string

	// JWT Configuration
	JWTSecret           string
	JWTExpiration       time.Duration
	JWTRefreshExpiration time.Duration

	// CORS Configuration
	CORSAllowedOrigins []string

	// Email Configuration
	EmailHost     string
	EmailPort     int
	EmailUsername string
	EmailPassword string

	// Upload Configuration
	MaxUploadSize int64
	UploadPath    string

	// Rate Limiting
	RateLimitRequests int
	RateLimitWindow   int
}

func Load() *Config {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	config := &Config{
		Port:        getEnvOrDefault("PORT", "8080"),
		Environment: getEnvOrDefault("ENV", "development"),

		MongoDBURI:      getEnvOrDefault("MONGODB_URI", "mongodb://localhost:27017"),
		MongoDBDatabase: getEnvOrDefault("MONGODB_DATABASE", "expedientes_db"),

		JWTSecret:           getEnvOrDefault("JWT_SECRET", "default-secret-change-in-production"),
		JWTExpiration:       parseDuration(getEnvOrDefault("JWT_EXPIRATION", "24h")),
		JWTRefreshExpiration: parseDuration(getEnvOrDefault("JWT_REFRESH_EXPIRATION", "168h")),

		CORSAllowedOrigins: parseStringSlice(getEnvOrDefault("CORS_ALLOWED_ORIGINS", "http://localhost:3000")),

		EmailHost:     getEnvOrDefault("EMAIL_HOST", ""),
		EmailPort:     parseInt(getEnvOrDefault("EMAIL_PORT", "587")),
		EmailUsername: getEnvOrDefault("EMAIL_USERNAME", ""),
		EmailPassword: getEnvOrDefault("EMAIL_PASSWORD", ""),

		MaxUploadSize: parseInt64(getEnvOrDefault("MAX_UPLOAD_SIZE", "10485760")), // 10MB
		UploadPath:    getEnvOrDefault("UPLOAD_PATH", "./uploads"),

		RateLimitRequests: parseInt(getEnvOrDefault("RATE_LIMIT_REQUESTS", "1000")),
		RateLimitWindow:   parseInt(getEnvOrDefault("RATE_LIMIT_WINDOW", "3600")),
	}

	return config
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func parseInt(s string) int {
	value, err := strconv.Atoi(s)
	if err != nil {
		log.Printf("Error parsing integer %s: %v", s, err)
		return 0
	}
	return value
}

func parseInt64(s string) int64 {
	value, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		log.Printf("Error parsing int64 %s: %v", s, err)
		return 0
	}
	return value
}

func parseDuration(s string) time.Duration {
	duration, err := time.ParseDuration(s)
	if err != nil {
		log.Printf("Error parsing duration %s: %v", s, err)
		return 24 * time.Hour // default 24 hours
	}
	return duration
}

func parseStringSlice(s string) []string {
	if s == "" {
		return []string{}
	}
	return strings.Split(s, ",")
}