package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents a system user
type User struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Email     string             `json:"email" bson:"email" binding:"required,email"`
	Password  string             `json:"-" bson:"password" binding:"required,min=6"`
	Nombre    string             `json:"nombre" bson:"nombre" binding:"required"`
	Apellido  string             `json:"apellido" bson:"apellido" binding:"required"`
	Documento string             `json:"documento" bson:"documento" binding:"required"`
	Telefono  string             `json:"telefono" bson:"telefono"`
	// ProfileID references a Profile document that groups roles/permissions
	ProfileID primitive.ObjectID `json:"profile_id,omitempty" bson:"profile_id,omitempty"`
	// Roles are explicit permissions granted to the user (can be added/removed on user)
	Roles     []string  `json:"roles" bson:"roles"`
	Activo    bool      `json:"activo" bson:"activo"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time `json:"updated_at" bson:"updated_at"`
}

// UserRole represents the different user roles
type UserRole string

const (
	RoleAdmin      UserRole = "administrador"
	RoleJuez       UserRole = "juez"
	RoleSecretario UserRole = "secretario"
	RoleAbogado    UserRole = "abogado"
)

// UserLogin represents login request
type UserLogin struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// UserResponse represents user data returned to client (without password)
type UserResponse struct {
	ID        primitive.ObjectID `json:"id"`
	Email     string             `json:"email"`
	Nombre    string             `json:"nombre"`
	Apellido  string             `json:"apellido"`
	Documento string             `json:"documento"`
	Telefono  string             `json:"telefono"`
	ProfileID primitive.ObjectID `json:"profile_id,omitempty" bson:"profile_id,omitempty"`
	Roles     []string           `json:"roles"`
	Activo    bool               `json:"activo"`
	CreatedAt time.Time          `json:"created_at"`
	UpdatedAt time.Time          `json:"updated_at"`
}

// ToUserResponse converts User to UserResponse
func (u *User) ToUserResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Email:     u.Email,
		Nombre:    u.Nombre,
		Apellido:  u.Apellido,
		Documento: u.Documento,
		Telefono:  u.Telefono,
		ProfileID: u.ProfileID,
		Roles:     u.Roles,
		Activo:    u.Activo,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

// ChangePasswordRequest represents password change request
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

// AuthResponse represents authentication response
type AuthResponse struct {
	User         UserResponse `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresAt    time.Time    `json:"expires_at"`
}

// RefreshTokenRequest represents refresh token request
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}
