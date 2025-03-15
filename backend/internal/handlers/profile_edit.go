package handlers

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
)

type UpdateProfileInput struct {
	Username       string `json:"username"`
	DisplayName    string `json:"display_name"`
	ProfilePicture string `json:"profile_picture"`
}

func UpdateUserProfile(w http.ResponseWriter, r *http.Request) {
	var input UpdateProfileInput
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Invalid json body", http.StatusBadRequest)
		return
	}

	var rawPic []byte
	if input.ProfilePicture != "" {
		data := input.ProfilePicture
		if strings.HasPrefix(data, "data:image") {
			parts := strings.SplitN(data, ",", 2)
			if len(parts) == 2 {
				data = parts[1]
			}
		}
		pic, err := base64.StdEncoding.DecodeString(data)
		if err != nil {
			http.Error(w, "Invalid base64 image data", http.StatusBadRequest)
			return
		}
		rawPic = pic
	}

	query := `
        UPDATE users
        SET display_name = $1,
            profile_picture = $2
        WHERE username = $3
        RETURNING username
    `

	var updatedUsername string
	err = db.DB.QueryRow(query, input.DisplayName, rawPic, input.Username).Scan(&updatedUsername)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Profile updated successfully"}`))
}
