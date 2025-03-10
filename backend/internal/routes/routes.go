package routes

import (
    "net/http"
    "github.com/BenH9999/CampusConnect/backend/internal/handlers"
)

func SetupRouter() http.Handler {
    mux := http.NewServeMux()

    mux.HandleFunc("/api/register", handlers.Register)
    mux.HandleFunc("/api/login", handlers.Login)

    return mux
}
