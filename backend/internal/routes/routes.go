package routes

import (
	"fmt"
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
	mux.HandleFunc("/api/posts/like", handlers.ToggleLike)
	mux.HandleFunc("/api/posts/like/status", handlers.CheckLikeStatus)
	mux.HandleFunc("/api/comments/create", handlers.CreateComment)

	// Notification endpoints
	mux.HandleFunc("/api/notifications", handlers.GetNotifications)
	mux.HandleFunc("/api/notifications/read", handlers.MarkNotificationRead)
	mux.HandleFunc("/api/notifications/read-all", handlers.MarkAllNotificationsRead)
	mux.HandleFunc("/api/notifications/unread-count", handlers.GetUnreadCount)

	// Message endpoints
	fmt.Println("Setting up message endpoints...")
	mux.HandleFunc("/api/conversations", handlers.GetConversations)
	mux.HandleFunc("/api/messages", handlers.GetMessages)
	mux.HandleFunc("/api/messages/send", handlers.SendMessage)
	mux.HandleFunc("/api/conversations/create", handlers.CreateConversation)

	// This is the problematic endpoint
	fmt.Println("Registering /api/messages/unread-count endpoint")
	mux.HandleFunc("/api/messages/unread-count", handlers.GetUnreadMessagesCount)

	mux.HandleFunc("/api/followers", handlers.GetFollowers)

	fmt.Println("Router setup complete")
	return mux
}
