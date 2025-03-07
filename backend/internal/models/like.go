package models

import "time"

type Like struct {
    PostID int `json:"post_id"`
    Username string `json:"username"`
    CreatedAt time.Time `json:"created_at"`
}
