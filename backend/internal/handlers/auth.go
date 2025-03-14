package handlers

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"

	"golang.org/x/crypto/bcrypt"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
	"github.com/BenH9999/CampusConnect/backend/internal/models"
)

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

	defaultPFP, err := os.ReadFile("../assets/images/defaultpfp.png")
	if err != nil {
		log.Println("Error reading default profile picture:", err)
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

	response := struct {
		Message string `json:"message"`
	}{
		Message: "User created successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
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

	encodedPFP := base64.StdEncoding.EncodeToString(user.ProfilePicture)
	imageData := "data:image/png;base64," + encodedPFP

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
