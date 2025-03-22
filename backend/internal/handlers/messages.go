package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
	"github.com/BenH9999/CampusConnect/backend/internal/models"
)

// GetConversations returns a list of all conversations for the user
func GetConversations(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	// Get all conversations for the user
	rows, err := db.DB.Query(`
		SELECT c.id, c.created_at, c.updated_at
		FROM conversations c
		JOIN conversation_participants cp ON c.id = cp.conversation_id
		WHERE cp.username = $1
		ORDER BY c.updated_at DESC
	`, username)
	if err != nil {
		http.Error(w, "Failed to fetch conversations", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var conversationPreviews []models.ConversationPreview

	for rows.Next() {
		var conversation models.Conversation
		if err := rows.Scan(&conversation.ID, &conversation.CreatedAt, &conversation.UpdatedAt); err != nil {
			http.Error(w, "Failed to scan conversation data", http.StatusInternalServerError)
			return
		}

		// For each conversation, get the participants
		participantRows, err := db.DB.Query(`
			SELECT u.username, u.display_name, u.profile_picture
			FROM conversation_participants cp
			JOIN users u ON cp.username = u.username
			WHERE cp.conversation_id = $1 AND cp.username != $2
		`, conversation.ID, username)
		if err != nil {
			http.Error(w, "Failed to fetch participants", http.StatusInternalServerError)
			return
		}

		var participants []models.UserBasic
		for participantRows.Next() {
			var participant models.UserBasic
			if err := participantRows.Scan(&participant.Username, &participant.DisplayName, &participant.ProfilePicture); err != nil {
				participantRows.Close()
				http.Error(w, "Failed to scan participant data", http.StatusInternalServerError)
				return
			}
			participants = append(participants, participant)
		}
		participantRows.Close()

		// Get the last message in the conversation
		var lastMessage models.Message
		err = db.DB.QueryRow(`
			SELECT id, conversation_id, sender, content, created_at, read
			FROM messages
			WHERE conversation_id = $1
			ORDER BY created_at DESC
			LIMIT 1
		`, conversation.ID).Scan(
			&lastMessage.ID,
			&lastMessage.ConversationID,
			&lastMessage.Sender,
			&lastMessage.Content,
			&lastMessage.CreatedAt,
			&lastMessage.Read,
		)
		if err != nil {
			http.Error(w, "Failed to fetch last message", http.StatusInternalServerError)
			return
		}

		// Get unread message count
		var unreadCount int
		err = db.DB.QueryRow(`
			SELECT COUNT(*)
			FROM messages m
			JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
			WHERE m.conversation_id = $1 
			AND m.sender != $2 
			AND m.created_at > cp.last_read_at
			AND cp.username = $2
		`, conversation.ID, username).Scan(&unreadCount)
		if err != nil {
			http.Error(w, "Failed to fetch unread count", http.StatusInternalServerError)
			return
		}

		conversationPreviews = append(conversationPreviews, models.ConversationPreview{
			ID:           conversation.ID,
			Participants: participants,
			LastMessage:  lastMessage,
			UnreadCount:  unreadCount,
		})
	}

	// Return the conversation previews
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conversationPreviews)
}

// GetMessages returns all messages for a conversation
func GetMessages(w http.ResponseWriter, r *http.Request) {
	conversationIDStr := r.URL.Query().Get("conversation_id")
	username := r.URL.Query().Get("username")

	if conversationIDStr == "" || username == "" {
		http.Error(w, "Conversation ID and username are required", http.StatusBadRequest)
		return
	}

	conversationID, err := strconv.Atoi(conversationIDStr)
	if err != nil {
		http.Error(w, "Invalid conversation ID", http.StatusBadRequest)
		return
	}

	// Check if user is part of the conversation
	var count int
	err = db.DB.QueryRow(`
		SELECT COUNT(*)
		FROM conversation_participants
		WHERE conversation_id = $1 AND username = $2
	`, conversationID, username).Scan(&count)
	if err != nil || count == 0 {
		http.Error(w, "User not part of conversation", http.StatusForbidden)
		return
	}

	// Get all messages for the conversation
	rows, err := db.DB.Query(`
		SELECT id, conversation_id, sender, content, created_at, read
		FROM messages
		WHERE conversation_id = $1
		ORDER BY created_at ASC
	`, conversationID)
	if err != nil {
		http.Error(w, "Failed to fetch messages", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var message models.Message
		if err := rows.Scan(
			&message.ID,
			&message.ConversationID,
			&message.Sender,
			&message.Content,
			&message.CreatedAt,
			&message.Read,
		); err != nil {
			http.Error(w, "Failed to scan message data", http.StatusInternalServerError)
			return
		}
		messages = append(messages, message)
	}

	// Update last read time for the user
	_, err = db.DB.Exec(`
		UPDATE conversation_participants
		SET last_read_at = $1
		WHERE conversation_id = $2 AND username = $3
	`, time.Now(), conversationID, username)
	if err != nil {
		// Just log the error, no need to return it
		fmt.Println("Error updating last read time:", err)
	}

	// Mark messages as read
	_, err = db.DB.Exec(`
		UPDATE messages
		SET read = true
		WHERE conversation_id = $1 AND sender != $2
	`, conversationID, username)
	if err != nil {
		// Just log the error, no need to return it
		fmt.Println("Error marking messages as read:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

// SendMessage creates a new message in a conversation
func SendMessage(w http.ResponseWriter, r *http.Request) {
	var requestData struct {
		ConversationID int    `json:"conversation_id"`
		Sender         string `json:"sender"`
		Content        string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if requestData.ConversationID == 0 || requestData.Sender == "" || requestData.Content == "" {
		http.Error(w, "Conversation ID, sender, and content are required", http.StatusBadRequest)
		return
	}

	// Check if user is part of the conversation
	var count int
	err := db.DB.QueryRow(`
		SELECT COUNT(*)
		FROM conversation_participants
		WHERE conversation_id = $1 AND username = $2
	`, requestData.ConversationID, requestData.Sender).Scan(&count)
	if err != nil || count == 0 {
		http.Error(w, "User not part of conversation", http.StatusForbidden)
		return
	}

	// Create the message
	var messageID int
	err = db.DB.QueryRow(`
		INSERT INTO messages (conversation_id, sender, content, read)
		VALUES ($1, $2, $3, false)
		RETURNING id
	`, requestData.ConversationID, requestData.Sender, requestData.Content).Scan(&messageID)
	if err != nil {
		http.Error(w, "Failed to create message", http.StatusInternalServerError)
		return
	}

	// Update the conversation's updated_at timestamp
	_, err = db.DB.Exec(`
		UPDATE conversations
		SET updated_at = NOW()
		WHERE id = $1
	`, requestData.ConversationID)
	if err != nil {
		// Just log the error, no need to return it
		fmt.Println("Error updating conversation timestamp:", err)
	}

	// Get the created message to return
	var message models.Message
	err = db.DB.QueryRow(`
		SELECT id, conversation_id, sender, content, created_at, read
		FROM messages
		WHERE id = $1
	`, messageID).Scan(
		&message.ID,
		&message.ConversationID,
		&message.Sender,
		&message.Content,
		&message.CreatedAt,
		&message.Read,
	)
	if err != nil {
		http.Error(w, "Failed to fetch created message", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(message)
}

// CreateConversation creates a new conversation between two users
func CreateConversation(w http.ResponseWriter, r *http.Request) {
	var requestData struct {
		Creator   string `json:"creator"`
		Recipient string `json:"recipient"`
		Message   string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if requestData.Creator == "" || requestData.Recipient == "" || requestData.Message == "" {
		http.Error(w, "Creator, recipient, and message are required", http.StatusBadRequest)
		return
	}

	// First, check if there's already a conversation between these users
	var existingConversationID int
	err := db.DB.QueryRow(`
		SELECT c.id
		FROM conversations c
		JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
		JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
		WHERE cp1.username = $1 AND cp2.username = $2
		  AND cp1.conversation_id = cp2.conversation_id
	`, requestData.Creator, requestData.Recipient).Scan(&existingConversationID)

	var conversationID int

	if err == nil {
		// Conversation exists, use it
		conversationID = existingConversationID
	} else {
		// Create a new conversation
		err = db.DB.QueryRow(`
			INSERT INTO conversations (created_at, updated_at)
			VALUES (NOW(), NOW())
			RETURNING id
		`).Scan(&conversationID)
		if err != nil {
			http.Error(w, "Failed to create conversation", http.StatusInternalServerError)
			return
		}

		// Add participants
		_, err = db.DB.Exec(`
			INSERT INTO conversation_participants (conversation_id, username, last_read_at)
			VALUES ($1, $2, NOW()), ($1, $3, NOW())
		`, conversationID, requestData.Creator, requestData.Recipient)
		if err != nil {
			http.Error(w, "Failed to add participants", http.StatusInternalServerError)
			return
		}
	}

	// Create the initial message
	var messageID int
	err = db.DB.QueryRow(`
		INSERT INTO messages (conversation_id, sender, content, read)
		VALUES ($1, $2, $3, false)
		RETURNING id
	`, conversationID, requestData.Creator, requestData.Message).Scan(&messageID)
	if err != nil {
		http.Error(w, "Failed to create message", http.StatusInternalServerError)
		return
	}

	// Get the conversation details to return
	var response struct {
		ConversationID int `json:"conversation_id"`
		MessageID      int `json:"message_id"`
	}
	response.ConversationID = conversationID
	response.MessageID = messageID

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetUnreadMessagesCount returns the number of unread messages for a user
func GetUnreadMessagesCount(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	var count int
	err := db.DB.QueryRow(`
		SELECT COUNT(*)
		FROM messages m
		JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
		WHERE m.sender != $1 
		AND m.created_at > cp.last_read_at
		AND cp.username = $1
	`, username).Scan(&count)
	if err != nil {
		http.Error(w, "Failed to fetch unread count", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"count": count})
}

// GetFollowers returns a list of users who follow the specified user
func GetFollowers(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	rows, err := db.DB.Query(`
		SELECT u.username, u.display_name, u.profile_picture
		FROM follows f
		JOIN users u ON f.follower = u.username
		WHERE f.following = $1
	`, username)
	if err != nil {
		http.Error(w, "Failed to fetch followers", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var followers []models.UserBasic
	for rows.Next() {
		var follower models.UserBasic
		if err := rows.Scan(&follower.Username, &follower.DisplayName, &follower.ProfilePicture); err != nil {
			http.Error(w, "Failed to scan follower data", http.StatusInternalServerError)
			return
		}
		followers = append(followers, follower)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(followers)
}
