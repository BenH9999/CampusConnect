package handlers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"

    "github.com/yourusername/CampusConnect/backend/internal/db"
    "github.com/yourusername/CampusConnect/backend/internal/models"
)
