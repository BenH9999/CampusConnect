package models

import "time"

type Post struct {
    ID int `json:"id"`
    Username string `json:"username"`
    Content string `json:"content"`
    CreatedAt time.Time `json:"created_at"`
}
