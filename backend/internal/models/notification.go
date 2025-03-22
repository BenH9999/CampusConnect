package models

import "time"

type NotificationType string

const (
	TypeLike    NotificationType = "like"
	TypeComment NotificationType = "comment"
	TypeFollow  NotificationType = "follow"
)

type Notification struct {
	ID         int64            `json:"id"`
	Username   string           `json:"username"`    // Who receives the notification
	SenderName string           `json:"sender_name"` // Who triggered the notification
	Type       NotificationType `json:"type"`
	PostID     *int64           `json:"post_id,omitempty"`    // Optional: relevant for likes/comments
	CommentID  *int64           `json:"comment_id,omitempty"` // Optional: relevant for comment replies
	Message    string           `json:"message"`
	Read       bool             `json:"read"`
	CreatedAt  time.Time        `json:"created_at"`
}
