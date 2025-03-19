package handlers

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"time"

	"github.com/BenH9999/CampusConnect/backend/internal/db"
)

type CreatePostInput struct {
	Username string `json:"username"`
	Content  string `json:"content"`
}

type PostResponse struct {
	ID            int       `json:"id"`
	Username      string    `json:"username"`
	Content       string    `json:"content"`
	CreatedAt     time.Time `json:"created_at"`
	LikesCount    int       `json:"likes_count"`
	CommentsCount int       `json:"comments_count"`
}

func CreatePost(w http.ResponseWriter, r *http.Request) {
	var input CreatePostInput
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	if input.Username == "" || input.Content == "" {
		http.Error(w, "Username and Content are required", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO posts (username, content, created_at) VALUES ($1, $2, NOW()) RETURNING id, created_at`
	var id int
	var createdAt time.Time
	err = db.DB.QueryRow(query, input.Username, input.Content).Scan(&id, &createdAt)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	post := PostResponse{
		ID:            id,
		Username:      input.Username,
		Content:       input.Content,
		CreatedAt:     createdAt,
		LikesCount:    0,
		CommentsCount: 0,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

type PostDetail struct {
	ID             int       `json:"id"`
	Username       string    `json:"username"`
	DisplayName    string    `json:"display_name"`
	ProfilePicture string    `json:"profile_picture"`
	Content        string    `json:"content"`
	CreatedAt      time.Time `json:"created_at"`
	LikesCount     int       `json:"likes_count"`
	CommentsCount  int       `json:"comments_count"`
}

type CommentDetail struct {
	ID             int       `json:"id"`
	PostID         int       `json:"post_id"`
	Username       string    `json:"username"`
	DisplayName    string    `json:"display_name"`
	ProfilePicture string    `json:"profile_picture"`
	Content        string    `json:"content"`
	CreatedAt      time.Time `json:"created_at"`
}

type ViewPostResponse struct {
	Post     PostDetail      `json:"post"`
	Comments []CommentDetail `json:"comments"`
}

func ViewPost(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Post id parameter required", http.StatusBadRequest)
		return
	}

	postQuery := `
	SELECT 
		p.id,
		p.content,
		p.created_at,
		(SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
		(SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count,
		u.username,
		u.display_name,
		u.profile_picture
	FROM posts p
	JOIN users u ON p.username = u.username
	WHERE p.id = $1
	`

	var post PostDetail
	var rawPic []byte
	err := db.DB.QueryRow(postQuery, idStr).Scan(
		&post.ID,
		&post.Content,
		&post.CreatedAt,
		&post.LikesCount,
		&post.CommentsCount,
		&post.Username,
		&post.DisplayName,
		&rawPic,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Post not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if len(rawPic) > 0 {
		post.ProfilePicture = "data:image/png;base64," + base64.StdEncoding.EncodeToString(rawPic)
	} else {
		post.ProfilePicture = ""
	}

	commentQuery := `
	SELECT 
		c.id,
		c.post_id,
		c.content,
		c.created_at,
		u.username,
		u.display_name,
		u.profile_picture
	FROM comments c
	JOIN users u ON c.username = u.username
	WHERE c.post_id = $1
	ORDER BY c.created_at ASC
	`
	rows, err := db.DB.Query(commentQuery, post.ID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var comments []CommentDetail
	for rows.Next() {
		var comment CommentDetail
		var cRawPic []byte
		err := rows.Scan(
			&comment.ID,
			&comment.PostID,
			&comment.Content,
			&comment.CreatedAt,
			&comment.Username,
			&comment.DisplayName,
			&cRawPic,
		)
		if err != nil {
			http.Error(w, "Error scanning comment: "+err.Error(), http.StatusInternalServerError)
			return
		}
		if len(cRawPic) > 0 {
			comment.ProfilePicture = "data:image/png;base64," + base64.StdEncoding.EncodeToString(cRawPic)
		} else {
			comment.ProfilePicture = ""
		}
		comments = append(comments, comment)
	}

	response := ViewPostResponse{
		Post:     post,
		Comments: comments,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
