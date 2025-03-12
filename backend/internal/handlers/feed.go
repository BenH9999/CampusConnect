package handlers

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"time"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
)

type PostFeedItem struct {
	ID             int       `json:"id"`
	Username       string    `json:"username"`
	DisplayName    string    `json:"display_name"`
	ProfilePicture string    `json:"profile_picture"`
	Content        string    `json:"content"`
	CreatedAt      time.Time `json:"created_at"`
	LikesCount     int       `json:"likes_count"`
	CommentsCount  int       `json:"comments_count"`
}

func GetFeed(w http.ResponseWriter, r *http.Request) {
	currentUser := r.URL.Query().Get("username")
	if currentUser == "" {
		http.Error(w, "username query parameter is required", http.StatusBadRequest)
		return
	}

	query := `
	    SELECT 
		    p.id,
		    p.username,
		    u.display_name,
		    u.profile_picture,
		    p.content,
		    p.created_at,
		    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
		    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
	    FROM posts p
	    JOIN users u ON p.username = u.username
	    WHERE p.username IN (
		    SELECT following FROM follows WHERE follower = $1
	    )
	    ORDER BY p.created_at DESC;
	`

	rows, err := db.DB.Query(query, currentUser)
	if err != nil {
		http.Error(w, "Database error"+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var feed []PostFeedItem
	for rows.Next() {
		var item PostFeedItem
		var profilePicture []byte
		err := rows.Scan(&item.ID, &item.Username, &item.DisplayName, &profilePicture, &item.Content, &item.CreatedAt, &item.LikesCount, &item.CommentsCount)
		if err != nil {
			http.Error(w, "Error scanning row: "+err.Error(), http.StatusInternalServerError)
			return
		}

		if len(profilePicture) > 0 {
			encoded := base64.StdEncoding.EncodeToString(profilePicture)
			item.ProfilePicture = "data:image/png;base64," + encoded
		} else {
			item.ProfilePicture = ""
		}
		feed = append(feed, item)
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(feed)
	if err != nil {
		http.Error(w, "Error encoding response: "+err.Error(), http.StatusInternalServerError)
	}
}
