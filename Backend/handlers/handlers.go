package handlers

import (
	"github.com/solaris-hms/mrf-backend/database"
)

// Handlers struct holds dependencies like the database connection and JWT secret.
type Handlers struct {
	DB        *database.DB
	JWTSecret string
}

// New creates a new Handlers struct with its dependencies.
func New(db *database.DB, jwtSecret string) *Handlers {
	return &Handlers{
		DB:        db,
		JWTSecret: jwtSecret,
	}
}
