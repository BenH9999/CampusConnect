package db

import (
    "log"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"

    "github.com/BenH9999/CampusConnect/backend/internal/config"
    "github.com/BenH9999/CampusConnect/backend/internal/models"
)

var DB *gorm.DB

func Connect() {
    var err error
    DB, err = gorm.Open(postgres.Open(config.GetDatabaseURL()), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    err = DB.AutoMigrate(&models.User{})
    if err != nil {
        log.Fatal("Failed to migrate database:", err)
    }

    log.Println("Database connected and migrated successfully")
}
