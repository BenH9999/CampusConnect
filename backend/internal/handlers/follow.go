package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
)

type FollowStatusResponse struct {
	IsFollowing bool `json:"isFollowing"`
}

func GetFollowStatus(w http.ResponseWriter, r *http.Request) {
	follower := r.URL.Query().Get("follower")
	following := r.URL.Query().Get("following")
	if follower == "" || following == "" {
		http.Error(w, "Both 'follower' and 'following' query parameters are required", http.StatusBadRequest)
		return
	}

	var count int
	query := `SELECT COUNT(*) FROM follows WHERE follower = $1 AND following = $2`
	err := db.DB.QueryRow(query, follower, following).Scan(&count)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := FollowStatusResponse{
		IsFollowing: count > 0,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

type ToggleFollowRequest struct {
	Follower  string `json:"follower"`
	Following string `json:"following"`
}

func ToggleFollow(w http.ResponseWriter, r *http.Request) {
	var req ToggleFollowRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	if req.Follower == "" || req.Following == "" {
		http.Error(w, "Both 'follower' and 'following' are required", http.StatusBadRequest)
		return
	}

	var count int
	checkQuery := `SELECT COUNT(*) FROM follows WHERE follower = $1 AND following = $2`
	err = db.DB.QueryRow(checkQuery, req.Follower, req.Following).Scan(&count)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if count > 0 {
		deleteQuery := `DELETE FROM follows WHERE follower = $1 AND following = $2`
		_, err = db.DB.Exec(deleteQuery, req.Follower, req.Following)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		insertQuery := `INSERT INTO follows (follower, following) VALUES ($1, $2)`
		_, err = db.DB.Exec(insertQuery, req.Follower, req.Following)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	var newCount int
	err = db.DB.QueryRow(checkQuery, req.Follower, req.Following).Scan(&newCount)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := FollowStatusResponse{
		IsFollowing: newCount > 0,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
