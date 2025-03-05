package handlers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"

    "github.com/BenH9999/CampusConnect/backend/internal/db"
    "github.com/BenH9999/CampusConnect/backend/internal/models"
)

type RegisterInput struct {
    Username string `json:"username" binding:"required"`
    Email string  `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

type LoginInput struct {
    Email string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
    var input RegisterInput
   
    err := c.ShouldBindBodyWithJSON(&input)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
        return
    }

    user := models.User {
        Username: input.Username,
        Email: input.Email,
        PasswordHash: string(hash),
    }

    err = db.DB.Create(&user).Error
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "registration successful"})
}

func Login(c *gin.Context) {
    var input LoginInput
        
    err := c.ShouldBindJSON(&input)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var user models.User
    err = db.DB.Where("email = ?", input.Email).First(&user).Error
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
        return
    }

    err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "login successful"})
}
