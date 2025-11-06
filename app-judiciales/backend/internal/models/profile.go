package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Profile represents a group of permissions that can be assigned to users
type Profile struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name" binding:"required,min=3,max=100"`
	Slug        string             `json:"slug" bson:"slug"` // e.g. "administrador"
	Description string             `json:"description" bson:"description"`

	// Direct permissions for the profile (simplified architecture)
	Permissions []Permission `json:"permissions" bson:"permissions"`

	Active    bool               `json:"active" bson:"active"`
	IsSystem  bool               `json:"is_system" bson:"is_system"` // System profiles cannot be deleted
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
	CreatedBy primitive.ObjectID `json:"created_by" bson:"created_by"`
	UpdatedBy primitive.ObjectID `json:"updated_by" bson:"updated_by"`
}

// ProfileResponse represents a profile returned to clients
type ProfileResponse struct {
	ID          primitive.ObjectID `json:"id"`
	Name        string             `json:"name"`
	Slug        string             `json:"slug"`
	Description string             `json:"description"`
	Permissions []Permission       `json:"permissions"` // Direct permissions of the profile
	Active      bool               `json:"active"`      // Profile status
	IsSystem    bool               `json:"is_system"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
}

// ToProfileResponse converts Profile to ProfileResponse
func (p *Profile) ToProfileResponse() ProfileResponse {
	return ProfileResponse{
		ID:          p.ID,
		Name:        p.Name,
		Slug:        p.Slug,
		Description: p.Description,
		Permissions: p.Permissions,
		Active:      p.Active,
		IsSystem:    p.IsSystem,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

// CreateProfileRequest represents the request to create a new profile
type CreateProfileRequest struct {
	Name        string       `json:"name" binding:"required,min=3,max=100"`
	Slug        string       `json:"slug" binding:"required,min=3,max=50,alphanum"`
	Description string       `json:"description" binding:"max=500"`
	Permissions []Permission `json:"permissions"` // Direct permissions for the profile
}

// UpdateProfileRequest represents the request to update a profile
type UpdateProfileRequest struct {
	Name        string       `json:"name" binding:"omitempty,min=3,max=100"`
	Description string       `json:"description" binding:"omitempty,max=500"`
	Permissions []Permission `json:"permissions"` // Direct permissions for the profile
	Active      *bool        `json:"active"`
}

// UpdatePermissionsRequest represents the request to update profile permissions
type UpdatePermissionsRequest struct {
	Permissions []Permission `json:"permissions" binding:"required"`
}

// PermissionList represents a list of available permissions
type PermissionList struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Category    string `json:"category"`
}

// GetAllPermissions returns all available permissions with descriptions
func GetAllPermissions() []PermissionList {
	return []PermissionList{
		// User permissions
		{Name: string(PermissionUserRead), Description: "Ver usuarios", Category: "users"},
		{Name: string(PermissionUserCreate), Description: "Crear usuarios", Category: "users"},
		{Name: string(PermissionUserUpdate), Description: "Actualizar usuarios", Category: "users"},
		{Name: string(PermissionUserDelete), Description: "Eliminar usuarios", Category: "users"},

		// Profile permissions
		{Name: string(PermissionProfileRead), Description: "Ver perfiles", Category: "profiles"},
		{Name: string(PermissionProfileCreate), Description: "Crear perfiles", Category: "profiles"},
		{Name: string(PermissionProfileUpdate), Description: "Actualizar perfiles", Category: "profiles"},
		{Name: string(PermissionProfileDelete), Description: "Eliminar perfiles", Category: "profiles"},

		// Expediente permissions
		{Name: string(PermissionExpedienteRead), Description: "Ver expedientes", Category: "expedientes"},
		{Name: string(PermissionExpedienteCreate), Description: "Crear expedientes", Category: "expedientes"},
		{Name: string(PermissionExpedienteUpdate), Description: "Actualizar expedientes", Category: "expedientes"},
		{Name: string(PermissionExpedienteDelete), Description: "Eliminar expedientes", Category: "expedientes"},

		// System permissions
		{Name: string(PermissionSystemAdmin), Description: "Administrador del sistema", Category: "system"},

		// Dashboard permissions
		{Name: string(PermissionDashboardView), Description: "Ver dashboard", Category: "dashboard"},
		{Name: string(PermissionDashboardStats), Description: "Ver estadísticas del dashboard", Category: "dashboard"},
		{Name: string(PermissionDashboardExport), Description: "Exportar datos del dashboard", Category: "dashboard"},
	}
}
