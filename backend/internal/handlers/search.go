package handlers

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
)

type UserResult struct {
	Username       string `json:"username"`
	DisplayName    string `json:"display_name"`
	ProfilePicture string `json:"profile_picture"`
	Email          string `json:"email"`
}

func SearchUsers(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]UserResult{})
		return
	}

	searchQuery := "%" + strings.ToLower(query) + "%"

	rows, err := db.DB.Query(`
        SELECT username, display_name, profile_picture, email 
        FROM users 
        WHERE LOWER(username) LIKE $1 OR LOWER(display_name) LIKE $1
    `, searchQuery)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var results []UserResult
	for rows.Next() {
		var u UserResult
		var rawPic []byte
		err := rows.Scan(&u.Username, &u.DisplayName, &rawPic, &u.Email)
		if err != nil {
			http.Error(w, "Error scanning user: "+err.Error(), http.StatusInternalServerError)
			return
		}

		if len(rawPic) > 0 {
			encoded := base64.StdEncoding.EncodeToString(rawPic)
			u.ProfilePicture = "data:image/png;base64," + encoded
		} else {
			u.ProfilePicture = ""
		}

		results = append(results, u)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
