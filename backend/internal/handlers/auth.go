package handlers

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"

	"golang.org/x/crypto/bcrypt"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
	"github.com/BenH9999/CampusConnect/backend/internal/models"
)

// Hardcoded default profile picture as base64
const defaultProfilePictureBase64 = "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"

type RegisterInput struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(w http.ResponseWriter, r *http.Request) {
	var input RegisterInput

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Decode the hardcoded default profile picture
	defaultPFP, err := base64.StdEncoding.DecodeString(defaultProfilePictureBase64)
	if err != nil {
		defaultPFP = []byte{}
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	user := struct {
		Username    string
		Email       string
		Password    string
		DisplayName string
		ProfilePic  []byte
	}{
		Username:    input.Username,
		Email:       input.Email,
		Password:    string(hash),
		DisplayName: input.Username,
		ProfilePic:  defaultPFP,
	}

	query := `INSERT INTO users (username, email, password, display_name, profile_picture) VALUES ($1, $2, $3, $4, $5)`
	_, err = db.DB.Exec(query, user.Username, user.Email, user.Password, user.DisplayName, user.ProfilePic)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Registration failed", http.StatusInternalServerError)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Always use the data URI format for the response
	imageData := "data:image/png;base64," + defaultProfilePictureBase64

	response := map[string]string{
		"username":        user.Username,
		"email":           user.Email,
		"display_name":    user.DisplayName,
		"profile_picture": imageData,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func Login(w http.ResponseWriter, r *http.Request) {
	var input LoginInput

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	query := `SELECT username, email, password, display_name, profile_picture FROM users WHERE email = $1`

	var user models.User
	err = db.DB.QueryRow(query, input.Email).Scan(&user.Username, &user.Email, &user.Password, &user.DisplayName, &user.ProfilePicture)
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	var imageData string
	if len(user.ProfilePicture) > 0 {
		encodedPFP := base64.StdEncoding.EncodeToString(user.ProfilePicture)
		imageData = "data:image/png;base64," + encodedPFP
	} else {
		// Use the hardcoded default if no profile picture exists
		imageData = "data:image/png;base64," + defaultProfilePictureBase64
	}

	response := map[string]string{
		"username":        user.Username,
		"email":           user.Email,
		"display_name":    user.DisplayName,
		"profile_picture": imageData,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
