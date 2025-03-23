package db

import (
	"database/sql"
	"log"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/BenH9999/CampusConnect/backend/internal/config"
)

var DB *sql.DB

// Connect establishes a connection to the database with retry logic
func Connect() {
	var err error
	var retries int = 5
	var retryDelay time.Duration = 5 * time.Second

	for i := 0; i < retries; i++ {
		log.Printf("Attempting database connection (attempt %d/%d)...", i+1, retries)

		DB, err = sql.Open("pgx", config.GetDatabaseURL())
		if err == nil {
			// Try pinging the database to verify connection
			err = DB.Ping()
			if err == nil {
				log.Println("Database connected successfully")
				return
			}
		}

		log.Printf("Failed to connect to database: %v", err)

		if i < retries-1 {
			log.Printf("Retrying in %v...", retryDelay)
			time.Sleep(retryDelay)
		}
	}

	log.Fatal("Failed to connect to database after multiple attempts:", err)
}
