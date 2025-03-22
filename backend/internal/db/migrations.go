package db

import (
	"log"
	"os"

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
	// Try multiple possible paths for the default profile picture
	imagePaths := []string{
		"/root/assets/images/defaultpfp.png",
		"assets/images/defaultpfp.png",
		"/app/assets/images/defaultpfp.png",
		"../assets/images/defaultpfp.png",
		"../../assets/images/defaultpfp.png",
		"backend/assets/images/defaultpfp.png",
		"/home/bennh/work/uni/app_dev/CampusConnect/assets/images/defaultpfp.png",
	}

	var defaultPFP []byte
	var err error

	for _, path := range imagePaths {
		defaultPFP, err = os.ReadFile(path)
		if err == nil {
			log.Printf("Successfully loaded profile picture from: %s", path)
			break
		} else {
			log.Printf("Failed to load profile picture from: %s - %v", path, err)
		}
	}

	if err != nil {
		log.Println("Could not load default profile picture from any path, using empty image")
		defaultPFP = []byte{}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Error hashing sample password:", err)
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
