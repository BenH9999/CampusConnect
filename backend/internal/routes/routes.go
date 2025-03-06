package routes

import (
    "github.com/gin-gonic/gin"
    "github.com/BenH9999/CampusConnect/backend/internal/handlers"
)

func SetupRouter() *gin.Engine {
    router := gin.Default()

    api := router.Group("/api") 
    {
        api.POST("/register", handlers.Register)
        api.POST("/login", handlers.Login)
    }

    return router
}
