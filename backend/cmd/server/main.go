package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
	"github.com/BenH9999/CampusConnect/backend/internal/routes"
)

func main() {
	// Connect to the database
	db.Connect()

	// Initialize database tables and sample data
	db.InitTables()

	// Set up the router
	router := routes.SetupRouter()

	// Log the setup of the unread messages count endpoint
	fmt.Println("Registering endpoint: /api/messages/unread-count")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Server running on port:", port)

	err := http.ListenAndServe(":"+port, router)
	if err != nil {
		log.Fatal("Server error: ", err)
	}
}
