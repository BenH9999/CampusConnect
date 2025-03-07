package db

import (
    "log"
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
