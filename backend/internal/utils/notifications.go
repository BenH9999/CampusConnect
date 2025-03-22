package utils

import (
	"log"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
	"github.com/BenH9999/CampusConnect/backend/internal/models"
)

// CreateNotification generates a notification in the database
func CreateNotification(username, senderName, notificationType string, postID, commentID *int, message string) {
	_, err := db.DB.Exec(
		`INSERT INTO notifications (username, sender_name, type, post_id, comment_id, message, read)
		 VALUES ($1, $2, $3, $4, $5, $6, false)`,
		username, senderName, notificationType, postID, commentID, message,
	)

	if err != nil {
		log.Printf("Error creating notification: %v", err)
	}
}

// CreateLikeNotification creates a notification for a like event
func CreateLikeNotification(postID int, likedByUsername string) {
	// First get the post owner
	var postOwner string
	err := db.DB.QueryRow("SELECT username FROM posts WHERE id = $1", postID).Scan(&postOwner)
	if err != nil {
		log.Printf("Error finding post owner for notification: %v", err)
		return
	}

	// Don't notify if user likes their own post
	if postOwner == likedByUsername {
		return
	}

	// Get the display name for a more friendly message
	var displayName string
	err = db.DB.QueryRow("SELECT display_name FROM users WHERE username = $1", likedByUsername).Scan(&displayName)
	if err != nil {
		displayName = likedByUsername
	}

	message := displayName + " liked your post"
	CreateNotification(postOwner, likedByUsername, string(models.TypeLike), &postID, nil, message)
}

// CreateCommentNotification creates a notification for a comment event
func CreateCommentNotification(postID int, commentedByUsername string) {
	// First get the post owner
	var postOwner string
	err := db.DB.QueryRow("SELECT username FROM posts WHERE id = $1", postID).Scan(&postOwner)
	if err != nil {
		log.Printf("Error finding post owner for notification: %v", err)
		return
	}

	// Don't notify if user comments on their own post
	if postOwner == commentedByUsername {
		return
	}

	// Get the display name for a more friendly message
	var displayName string
	err = db.DB.QueryRow("SELECT display_name FROM users WHERE username = $1", commentedByUsername).Scan(&displayName)
	if err != nil {
		displayName = commentedByUsername
	}

	message := displayName + " commented on your post"
	CreateNotification(postOwner, commentedByUsername, string(models.TypeComment), &postID, nil, message)
}

// CreateFollowNotification creates a notification for a follow event
func CreateFollowNotification(followedUsername, followerUsername string) {
	// Get the display name for a more friendly message
	var displayName string
	err := db.DB.QueryRow("SELECT display_name FROM users WHERE username = $1", followerUsername).Scan(&displayName)
	if err != nil {
		displayName = followerUsername
	}

	message := displayName + " started following you"
	CreateNotification(followedUsername, followerUsername, string(models.TypeFollow), nil, nil, message)
}
