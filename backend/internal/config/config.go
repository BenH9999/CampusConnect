package config

import (
	"fmt"
	"os"
)

// GetDatabaseURL constructs a database connection string from environment variables
func GetDatabaseURL() string {
	if url := os.Getenv("DATABASE_URL"); url != "" {
		return url
	}

	host := getEnvWithDefault("DB_HOST", "localhost")
	port := getEnvWithDefault("DB_PORT", "5432")
	user := getEnvWithDefault("DB_USER", "postgres")
	password := getEnvWithDefault("DB_PASSWORD", "postgres")
	dbname := getEnvWithDefault("DB_NAME", "campusconnect")

	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		user, password, host, port, dbname)
}

func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
