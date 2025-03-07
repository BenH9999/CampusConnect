package models

import "time"

type Follow struct {
    Follower string `json:"follower"`
    Following string `json:"following"`
    CreatedAt time.Time `json:"created_at"`
}
