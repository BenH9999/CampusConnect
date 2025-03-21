package config

import "os"

func GetDatabaseURL() string {
	if url := os.Getenv("DATABASE_URL"); url != "" {
		return url
	}

	return "postgres://bennh:your_password@localhost:5432/campusconnect?sslmode=disable"
}
