package models

import "time"

type Message struct {
	ID             int       `json:"id"`
	ConversationID int       `json:"conversation_id"`
	Sender         string    `json:"sender"`
	Content        string    `json:"content"`
	CreatedAt      time.Time `json:"created_at"`
	Read           bool      `json:"read"`
}

type Conversation struct {
	ID        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ConversationParticipant struct {
	ConversationID int       `json:"conversation_id"`
	Username       string    `json:"username"`
	LastReadAt     time.Time `json:"last_read_at"`
}

type ConversationPreview struct {
	ID           int         `json:"id"`
	Participants []UserBasic `json:"participants"`
	LastMessage  Message     `json:"last_message"`
	UnreadCount  int         `json:"unread_count"`
}

type UserBasic struct {
	Username       string `json:"username"`
	DisplayName    string `json:"display_name"`
	ProfilePicture []byte `json:"profile_picture"`
}
