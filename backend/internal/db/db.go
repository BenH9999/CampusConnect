package db

import (
    "log"
    "database/sql"

    _ "github.com/jackc/pgx/v5/stdlib"

    "github.com/BenH9999/CampusConnect/backend/internal/config"
)

var DB *sql.DB

func Connect() {
    var err error
    DB, err = sql.Open("pgx", config.GetDatabaseURL())
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    err = DB.Ping()
    if err != nil {
        log.Fatal("Failed to migrate database:", err)
    }

    log.Println("Database connected and migrated successfully")
}
