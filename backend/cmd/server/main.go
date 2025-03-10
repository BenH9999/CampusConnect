package main

import (
	"log"
	"net/http"
	"os"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
	"github.com/BenH9999/CampusConnect/backend/internal/routes"
)

func main() {
	db.Connect()
	db.InitTables()
	db.TempData()

	router := routes.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Server running on 192.168.0.5:", port)

	err := http.ListenAndServe("192.168.0.5:"+port, router)
	if err != nil {
		log.Fatal("Server error: ", err)
	}
}
