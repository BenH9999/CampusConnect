package handlers

import (
    "database/sql"
    "encoding/json"
    "errors"
    "net/http"

    "golang.org/x/crypto/bcrypt"

    "github.com/BenH9999/CampusConnect/backend/internal/db"
    "github.com/BenH9999/CampusConnect/backend/internal/models")

type RegisterInput struct {
    Username string `json:"username"`
    Email string  `json:"email"`
    Password string `json:"password"`
}

type LoginInput struct {
    Email string `json:"email"`
    Password string `json:"password"`
}

func Register(w http.ResponseWriter, r *http.Request) {
    var input RegisterInput
    
    err := json.NewDecoder(r.Body).Decode(&input)
    if err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Failed to hash password", http.StatusInternalServerError)
        return
    }

    query := `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`
    _, err = db.DB.Exec(query, input.Username, input.Email, string(hash))
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
	}}

func Login(w http.ResponseWriter, r *http.Request) {
    var input LoginInput
    
    err := json.NewDecoder(r.Body).Decode(&input)
    if err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    query := `SELECT username, email, password FROM users WHERE email = $1`

    var user models.User
    err = db.DB.QueryRow(query, input.Email).Scan(&user.Username, &user.Email, &user.Password)
    if err != nil {
        http.Error(w, "Invalid email or password", http.StatusUnauthorized)
        return
    }

    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
    if err != nil {
        http.Error(w, "Invalid email or password", http.StatusUnauthorized)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(struct {
        Username string `json:"username"`
        Email string `json:"email"`
    }{
        Username: user.Username,
        Email: user.Email,
    })
}
