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

    createTable := `
    CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(50) PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
    );
    `
    _, err := db.DB.Exec(createTable)
    if err != nil {
        log.Fatal("Error creating users table:", err)
    }

    router := routes.SetupRouter()

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Println("Server running on port ", port)
    
    err = http.ListenAndServe("192.168.0.5:"+port, router)
    if err != nil {
        log.Fatal("Server error: ", err)
    }
}
