package models

import "time"

type User struct {
    Username string `json:"username"`
    Email string `json:"email"`
    Password string `json:"password"`
    DisplayName string `json:"display_name"`
    ProfilePicture []byte `json:"profile_picture"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
