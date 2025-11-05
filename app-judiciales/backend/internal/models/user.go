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
	Documento string             `json:"documento" bson:"documento" binding:"required,len=8,numeric"`
	Telefono  string             `json:"telefono" bson:"telefono" binding:"omitempty,len=9,numeric"`
	// ProfileID references a Profile document that contains permissions
	ProfileID primitive.ObjectID `json:"profile_id" bson:"profile_id" binding:"required"`
	Activo    bool               `json:"activo" bson:"activo"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
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

// CreateUserRequest represents user creation request
type CreateUserRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	Nombre    string `json:"nombre" binding:"required"`
	Apellido  string `json:"apellido" binding:"required"`
	Documento string `json:"documento" binding:"required,len=8,numeric"`
	Telefono  string `json:"telefono" binding:"omitempty,len=9,numeric"`
	ProfileID string `json:"profile_id" binding:"required"`
}

// UpdateUserRequest represents user update request
type UpdateUserRequest struct {
	Nombre    *string `json:"nombre,omitempty" binding:"omitempty,min=1"`
	Apellido  *string `json:"apellido,omitempty" binding:"omitempty,min=1"`
	Documento *string `json:"documento,omitempty" binding:"omitempty,len=8,numeric"`
	Telefono  *string `json:"telefono,omitempty" binding:"omitempty,len=9,numeric"`
	ProfileID *string `json:"profile_id,omitempty"`
	Activo    *bool   `json:"activo,omitempty"`
}

// UpdateUserProfileRequest represents profile update request (for current user)
type UpdateUserProfileRequest struct {
	Nombre   *string `json:"nombre,omitempty" binding:"omitempty,min=1"`
	Apellido *string `json:"apellido,omitempty" binding:"omitempty,min=1"`
	Telefono *string `json:"telefono,omitempty" binding:"omitempty,len=9,numeric"`
}

// UserResponse represents user data returned to client (without password)
type UserResponse struct {
	ID        primitive.ObjectID `json:"id"`
	Email     string             `json:"email"`
	Nombre    string             `json:"nombre"`
	Apellido  string             `json:"apellido"`
	Documento string             `json:"documento"`
	Telefono  string             `json:"telefono"`
	ProfileID primitive.ObjectID `json:"profile_id"`
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
