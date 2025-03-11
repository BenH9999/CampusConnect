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
}

func TempData() {
	defaultPFP, err := os.ReadFile("../assets/images/defaultpfp.png")
	if err != nil {
		log.Println("Error reading default profile picture:", err)
		defaultPFP = []byte{}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Error hashing sample password:", err)
		return
	}

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
            VALUES ($1, $2, $3, $4, $5)`,
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

	for _, p := range samplePosts {
		_, err := DB.Exec(
			`INSERT INTO Posts (username, content) VALUES ($1, $2)`,
			p.username, p.content,
		)
		if err != nil {
			log.Println("Error inserting posts for", p.username, ":", err)
		}
	}

	_, err = DB.Exec(`INSERT INTO likes (post_id, username) VALUES ($1, $2)`, 1, "bob")
	if err != nil {
		log.Println("Error inserting like:", err)
	}
	_, err = DB.Exec(`INSERT INTO likes (post_id, username) VALUES ($1, $2)`, 2, "charlie")
	if err != nil {
		log.Println("Error inserting like:", err)
	}

	_, err = DB.Exec(`INSERT INTO comments (post_id, username, content) VALUES ($1, $2, $3)`, 2, "alice", "Nice post, Bob!")
	if err != nil {
		log.Println("Error inserting comment:", err)
	}

	_, err = DB.Exec(`INSERT INTO comments (post_id, username, content) VALUES ($1, $2, $3)`, 1, "bob", "Thanks, Alice!")
	if err != nil {
		log.Println("Error inserting comment:", err)
	}

	_, err = DB.Exec(`INSERT INTO follows (follower, following) VALUES ($1, $2)`, "alice", "bob")
	if err != nil {
		log.Println("Error inserting follow:", err)
	}

	_, err = DB.Exec(`INSERT INTO follows (follower, following) VALUES ($1, $2)`, "bob", "alice")
	if err != nil {
		log.Println("Error inserting follow:", err)
	}

	_, err = DB.Exec(`INSERT INTO follows (follower, following) VALUES ($1, $2)`, "charlie", "alice")
	if err != nil {
		log.Println("Error inserting follow:", err)
	}

	_, err = DB.Exec(`INSERT INTO follows (follower, following) VALUES ($1, $2)`, "charlie", "bob")
	if err != nil {
		log.Println("Error inserting follow:", err)
	}

	log.Println("Placeholder data inserted successfully.")
}
