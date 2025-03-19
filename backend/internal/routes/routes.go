package routes

import (
	"net/http"

	"github.com/BenH9999/CampusConnect/backend/internal/handlers"
)

func SetupRouter() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/register", handlers.Register)
	mux.HandleFunc("/api/login", handlers.Login)
	mux.HandleFunc("/api/feed", handlers.GetFeed)
	mux.HandleFunc("/api/profile", handlers.GetUserProfile)
	mux.HandleFunc("/api/profile/update", handlers.UpdateUserProfile)
	mux.HandleFunc("/api/follow/status", handlers.GetFollowStatus)
	mux.HandleFunc("/api/follow/toggle", handlers.ToggleFollow)
	mux.HandleFunc("/api/search/users", handlers.SearchUsers)
	mux.HandleFunc("/api/posts/create", handlers.CreatePost)
	mux.HandleFunc("/api/posts/view", handlers.ViewPost)
	mux.HandleFunc("/api/comments/create", handlers.CreateComment)

	return mux
}
