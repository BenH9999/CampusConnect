package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
	"github.com/BenH9999/CampusConnect/backend/internal/utils"
)

type CreateCommentInput struct {
	PostID   int    `json:"post_id"`
	Username string `json:"username"`
	Content  string `json:"content"`
}

type CommentResponse struct {
	ID        int       `json:"id"`
	PostID    int       `json:"post_id"`
	Username  string    `json:"username"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

func CreateComment(w http.ResponseWriter, r *http.Request) {
	var input CreateCommentInput
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "invalid request payload", http.StatusBadRequest)
		return
	}

	if input.PostID == 0 || input.Username == "" || input.Content == "" {
		http.Error(w, "missing required fields", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO comments (post_id, username, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, created_at`
	var id int
	var createdAt time.Time
	err = db.DB.QueryRow(query, input.PostID, input.Username, input.Content).Scan(&id, &createdAt)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create notification for post owner
	utils.CreateCommentNotification(input.PostID, input.Username)

	response := CommentResponse{
		ID:        id,
		PostID:    input.PostID,
		Username:  input.Username,
		Content:   input.Content,
		CreatedAt: createdAt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
