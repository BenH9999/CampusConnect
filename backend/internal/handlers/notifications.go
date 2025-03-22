package handlers

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
	"github.com/BenH9999/CampusConnect/backend/internal/models"
)

// NotificationWithSender extends the Notification model with sender details
type NotificationWithSender struct {
	models.Notification
	SenderDisplayName    string `json:"sender_display_name"`
	SenderProfilePicture string `json:"sender_profile_picture"`
}

// GetNotifications retrieves all notifications for a user
func GetNotifications(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract username from query parameter
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username parameter is required", http.StatusBadRequest)
		return
	}

	// Query database for notifications
	rows, err := db.DB.Query(`
		SELECT n.id, n.username, n.sender_name, n.type, n.post_id, n.comment_id, n.message, n.read, n.created_at,
		       u.display_name, u.profile_picture
		FROM notifications n
		JOIN users u ON n.sender_name = u.username
		WHERE n.username = $1
		ORDER BY n.created_at DESC
	`, username)
	if err != nil {
		http.Error(w, "Failed to fetch notifications: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Parse rows into notifications
	notifications := []NotificationWithSender{}

	for rows.Next() {
		var notification NotificationWithSender
		var postID, commentID *int64
		var profilePicture []byte
		if err := rows.Scan(
			&notification.ID,
			&notification.Username,
			&notification.SenderName,
			&notification.Type,
			&postID,
			&commentID,
			&notification.Message,
			&notification.Read,
			&notification.CreatedAt,
			&notification.SenderDisplayName,
			&profilePicture,
		); err != nil {
			http.Error(w, "Error scanning notification: "+err.Error(), http.StatusInternalServerError)
			return
		}
		notification.PostID = postID
		notification.CommentID = commentID

		// Encode profile picture as base64
		if len(profilePicture) > 0 {
			notification.SenderProfilePicture = base64.StdEncoding.EncodeToString(profilePicture)
		} else {
			notification.SenderProfilePicture = ""
		}

		notifications = append(notifications, notification)
	}

	// Return notifications as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

// MarkNotificationRead marks a notification as read
func MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract notification ID from query params
	notificationID := r.URL.Query().Get("id")
	if notificationID == "" {
		http.Error(w, "Notification ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.ParseInt(notificationID, 10, 64)
	if err != nil {
		http.Error(w, "Invalid notification ID", http.StatusBadRequest)
		return
	}

	// Update notification status in database
	_, err = db.DB.Exec("UPDATE notifications SET read = true WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Failed to update notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// MarkAllNotificationsRead marks all notifications for a user as read
func MarkAllNotificationsRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract username from query parameter
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username parameter is required", http.StatusBadRequest)
		return
	}

	// Update all notifications for the user
	_, err := db.DB.Exec("UPDATE notifications SET read = true WHERE username = $1", username)
	if err != nil {
		http.Error(w, "Failed to update notifications: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// GetUnreadCount gets the count of unread notifications for a user
func GetUnreadCount(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract username from query parameter
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username parameter is required", http.StatusBadRequest)
		return
	}

	// Query database for unread count
	var count int
	err := db.DB.QueryRow("SELECT COUNT(*) FROM notifications WHERE username = $1 AND read = false", username).Scan(&count)
	if err != nil {
		http.Error(w, "Failed to count notifications: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return count as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"count": count})
}
