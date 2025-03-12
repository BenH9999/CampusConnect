package handlers

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"time"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
)

type UserProfile struct {
	Username       string    `json:"username"`
	Email          string    `json:"email"`
	DisplayName    string    `json:"display_name"`
	ProfilePicture string    `json:"profile_picture"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type PostProfileItem struct {
	ID             string    `json:"id"`
	Username       string    `json:"username"`
	DisplayName    string    `json:"display_name"`
	ProfilePicture string    `json:"profile_picture"`
	Content        string    `json:"content"`
	CreatedAt      time.Time `json:"created_at"`
	LikesCount     int       `json:"likes_count"`
	CommentsCount  int       `json:"comments_count"`
}

func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username query parameter is required", http.StatusBadRequest)
		return
	}

	var userProfile UserProfile
	var rawProfilePic []byte
	queryUser := `
        SELECT username, email, display_name, profile_picture, created_at, updated_at
        FROM users
        WHERE username = $1
    `

	err := db.DB.QueryRow(queryUser, username).Scan(
		&userProfile.Username,
		&userProfile.Email,
		&userProfile.DisplayName,
		&rawProfilePic,
		&userProfile.CreatedAt,
		&userProfile.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if len(rawProfilePic) > 0 {
		userProfile.ProfilePicture = "data:image/png;base64," + base64.StdEncoding.EncodeToString(rawProfilePic)
	} else {
		userProfile.ProfilePicture = ""
	}

	queryPosts := `
	    SELECT 
	        p.id,
	        p.content,
	        p.created_at,
	        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
	        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
	    FROM posts p
	    WHERE p.username = $1
	    ORDER BY p.created_at DESC;
	`
	rows, err := db.DB.Query(queryPosts, username)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var posts []PostProfileItem
	for rows.Next() {
		var post PostProfileItem
		err := rows.Scan(&post.ID, &post.Content, &post.CreatedAt, &post.LikesCount, &post.CommentsCount)
		if err != nil {
			http.Error(w, "Error scanning post: "+err.Error(), http.StatusInternalServerError)
			return
		}
		posts = append(posts, post)
	}

	response := struct {
		User  UserProfile       `json:"user"`
		Posts []PostProfileItem `json:"posts"`
	}{
		User:  userProfile,
		Posts: posts,
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Error encoding response: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
