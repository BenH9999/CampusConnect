package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
	"github.com/BenH9999/CampusConnect/backend/internal/utils"
)

type ToggleLikeRequest struct {
	PostID   int    `json:"post_id"`
	Username string `json:"username"`
}

type LikeResponse struct {
	IsLiked bool `json:"is_liked"`
	Count   int  `json:"count"`
}

// CheckLikeStatus checks if a user has liked a post
func CheckLikeStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	postID := r.URL.Query().Get("post_id")
	username := r.URL.Query().Get("username")

	if postID == "" || username == "" {
		http.Error(w, "post_id and username parameters are required", http.StatusBadRequest)
		return
	}

	// Check if the user has already liked this post
	var exists bool
	err := db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM likes WHERE post_id = $1 AND username = $2)",
		postID, username).Scan(&exists)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Get like count
	var count int
	err = db.DB.QueryRow("SELECT COUNT(*) FROM likes WHERE post_id = $1", postID).Scan(&count)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := LikeResponse{
		IsLiked: exists,
		Count:   count,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ToggleLike handles the liking/unliking of a post
func ToggleLike(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var req ToggleLikeRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.PostID == 0 || req.Username == "" {
		http.Error(w, "PostID and Username are required", http.StatusBadRequest)
		return
	}

	// Check if the user has already liked this post
	var exists bool
	err = db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM likes WHERE post_id = $1 AND username = $2)",
		req.PostID, req.Username).Scan(&exists)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Toggle like status
	if exists {
		// Unlike
		_, err = db.DB.Exec("DELETE FROM likes WHERE post_id = $1 AND username = $2",
			req.PostID, req.Username)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		// Like
		_, err = db.DB.Exec("INSERT INTO likes (post_id, username, created_at) VALUES ($1, $2, NOW())",
			req.PostID, req.Username)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Create notification when a post is liked (not when unliked)
		utils.CreateLikeNotification(req.PostID, req.Username)
	}

	// Get updated like count
	var count int
	err = db.DB.QueryRow("SELECT COUNT(*) FROM likes WHERE post_id = $1", req.PostID).Scan(&count)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return updated status
	response := LikeResponse{
		IsLiked: !exists, // Toggled from previous state
		Count:   count,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
