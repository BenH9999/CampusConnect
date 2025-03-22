package db

import (
	"encoding/base64"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func InitTables() {
	createUsersTable := `
        CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(50) PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        display_name VARCHAR(50) NOT NULL,
        profile_picture BYTEA NOT NULL DEFAULT E'',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    `
	_, err := DB.Exec(createUsersTable)
	if err != nil {
		log.Fatal("Error creating users table: ", err)
	}
	log.Println("Created users table")

	createPostsTable := `
        CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    `
	_, err = DB.Exec(createPostsTable)
	if err != nil {
		log.Fatal("Error creating posts table: ", err)
	}
	log.Println("Created posts table")

	createLikesTable := `
        CREATE TABLE IF NOT EXISTS likes (
        post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        PRIMARY KEY (post_id, username)
        );
    `
	_, err = DB.Exec(createLikesTable)
	if err != nil {
		log.Fatal("Error creating likes table: ", err)
	}
	log.Println("Created likes table")

	createCommentsTable := `
        CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    `
	_, err = DB.Exec(createCommentsTable)
	if err != nil {
		log.Fatal("Error creating comments table: ", err)
	}
	log.Println("Created comments table")

	createFollowsTable := `
        CREATE TABLE IF NOT EXISTS follows (
        follower VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        following VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        PRIMARY KEY (follower, following)
        );
    `
	_, err = DB.Exec(createFollowsTable)
	if err != nil {
		log.Fatal("Error creating follows table: ", err)
	}
	log.Println("Created follows table")

	createNotificationsTable := `
        CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        sender_name VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        comment_id INT REFERENCES comments(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    `
	_, err = DB.Exec(createNotificationsTable)
	if err != nil {
		log.Fatal("Error creating notifications table: ", err)
	}
	log.Println("Created notifications table")
}

func TempData() {
	log.Println("Inserting sample data...")

	// Using the same hardcoded default profile picture as in auth.go
	defaultProfilePictureBase64 := "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"

	// Decode the hardcoded default profile picture
	defaultPFP, err := base64.StdEncoding.DecodeString(defaultProfilePictureBase64)
	if err != nil {
		defaultPFP = []byte{}
	}

	// Create a hashed password for sample users
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Error hashing password:", err)
		return
	}

	// First, remove any existing sample data to prevent duplicates
	clearSampleData()

	sampleUsers := []struct {
		username    string
		email       string
		displayName string
	}{
		{"alice", "alice@example.com", "Alice"},
		{"bob", "bob@example.com", "Bob"},
		{"charlie", "charlie@example.com", "Charlie"},
	}

	for _, u := range sampleUsers {
		_, err := DB.Exec(
			`INSERT INTO users (username, email, password, display_name, profile_picture)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (username) DO UPDATE 
            SET email = $2, password = $3, display_name = $4, profile_picture = $5`,
			u.username, u.email, string(hashedPassword), u.displayName, defaultPFP,
		)
		if err != nil {
			log.Println("Error inserting user", u.username, ":", err)
		}
	}

	samplePosts := []struct {
		username string
		content  string
	}{
		{"alice", "Hello, this is Alice's first post!"},
		{"bob", "Hi, Bob here. Enjoying Campus Connect."},
		{"charlie", "Hey everyone, Charlie joining the conversation."},
	}

	// Keep track of post IDs for likes and comments
	var postIDs []int

	for _, p := range samplePosts {
		var id int
		err := DB.QueryRow(
			`INSERT INTO posts (username, content) 
             VALUES ($1, $2) 
             RETURNING id`,
			p.username, p.content,
		).Scan(&id)
		if err != nil {
			log.Println("Error inserting posts for", p.username, ":", err)
		} else {
			postIDs = append(postIDs, id)
		}
	}

	// Only add likes and comments if we have posts
	if len(postIDs) >= 2 {
		// Add likes
		_, err = DB.Exec(`INSERT INTO likes (post_id, username) VALUES ($1, $2) ON CONFLICT DO NOTHING`, postIDs[0], "bob")
		if err != nil {
			log.Println("Error inserting like:", err)
		}
		_, err = DB.Exec(`INSERT INTO likes (post_id, username) VALUES ($1, $2) ON CONFLICT DO NOTHING`, postIDs[1], "charlie")
		if err != nil {
			log.Println("Error inserting like:", err)
		}

		// Add comments
		_, err = DB.Exec(`INSERT INTO comments (post_id, username, content) VALUES ($1, $2, $3)`, postIDs[1], "alice", "Nice post, Bob!")
		if err != nil {
			log.Println("Error inserting comment:", err)
		}
		_, err = DB.Exec(`INSERT INTO comments (post_id, username, content) VALUES ($1, $2, $3)`, postIDs[0], "bob", "Thanks, Alice!")
		if err != nil {
			log.Println("Error inserting comment:", err)
		}

		// Sample notifications
		sampleNotifications := []struct {
			username   string
			senderName string
			notifType  string
			postID     *int
			commentID  *int
			message    string
		}{
			{"alice", "bob", "like", &postIDs[0], nil, "Bob liked your post"},
			{"alice", "bob", "comment", &postIDs[0], nil, "Bob commented on your post"},
			{"bob", "alice", "follow", nil, nil, "Alice started following you"},
			{"bob", "alice", "comment", &postIDs[1], nil, "Alice commented on your post"},
		}

		for _, n := range sampleNotifications {
			_, err := DB.Exec(
				`INSERT INTO notifications (username, sender_name, type, post_id, comment_id, message, read)
				VALUES ($1, $2, $3, $4, $5, $6, false)`,
				n.username, n.senderName, n.notifType, n.postID, n.commentID, n.message,
			)
			if err != nil {
				log.Println("Error inserting notification:", err)
			}
		}
	}

	// Add follows relationships
	follows := []struct {
		follower  string
		following string
	}{
		{"alice", "bob"},
		{"bob", "alice"},
		{"charlie", "alice"},
		{"charlie", "bob"},
	}

	for _, f := range follows {
		_, err = DB.Exec(`INSERT INTO follows (follower, following) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
			f.follower, f.following)
		if err != nil {
			log.Println("Error inserting follow:", err)
		}
	}

	log.Println("Placeholder data inserted successfully.")
}

// clearSampleData removes existing sample data to prevent duplicates
func clearSampleData() {
	// Clear in correct order to respect foreign key constraints
	_, err := DB.Exec(`DELETE FROM notifications`)
	if err != nil {
		log.Println("Error clearing notifications:", err)
	}

	_, err = DB.Exec(`DELETE FROM comments`)
	if err != nil {
		log.Println("Error clearing comments:", err)
	}

	_, err = DB.Exec(`DELETE FROM likes`)
	if err != nil {
		log.Println("Error clearing likes:", err)
	}

	_, err = DB.Exec(`DELETE FROM follows`)
	if err != nil {
		log.Println("Error clearing follows:", err)
	}

	_, err = DB.Exec(`DELETE FROM posts`)
	if err != nil {
		log.Println("Error clearing posts:", err)
	}

	log.Println("Cleared existing sample data")
}

// Helper function to convert int to *int for nullable fields
func ptrInt(i int) *int {
	return &i
}
