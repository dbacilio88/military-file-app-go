package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Profile represents a group of roles/permissions that can be assigned to users
type Profile struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name      string             `json:"name" bson:"name" binding:"required"`
	Slug      string             `json:"slug" bson:"slug"` // e.g. "administrador"
	Roles     []string           `json:"roles" bson:"roles"`
	Active    bool               `json:"active" bson:"active"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}

// ProfileResponse represents a profile returned to clients
type ProfileResponse struct {
	ID    primitive.ObjectID `json:"id"`
	Name  string             `json:"name"`
	Slug  string             `json:"slug"`
	Roles []string           `json:"roles"`
}

// ToProfileResponse converts Profile to ProfileResponse
func (p *Profile) ToProfileResponse() ProfileResponse {
	return ProfileResponse{
		ID:    p.ID,
		Name:  p.Name,
		Slug:  p.Slug,
		Roles: p.Roles,
	}
}
