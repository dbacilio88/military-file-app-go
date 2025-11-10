package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"expedientes-backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	ErrProfileNotFound           = errors.New("profile not found")
	ErrCannotDeleteSystemProfile = errors.New("cannot delete system profile")
)

// ProfileRepository handles profile data operations
type ProfileRepository struct {
	collection *mongo.Collection
}

// NewProfileRepository creates a new profile repository
func NewProfileRepository(db *mongo.Database) *ProfileRepository {
	return &ProfileRepository{
		collection: db.Collection("profiles"),
	}
}

// CreateProfile creates a new profile
func (r *ProfileRepository) CreateProfile(ctx context.Context, profile *models.Profile) (*models.Profile, error) {
	profile.ID = primitive.NewObjectID()
	profile.CreatedAt = time.Now()
	profile.UpdatedAt = time.Now()

	_, err := r.collection.InsertOne(ctx, profile)
	if err != nil {
		return nil, fmt.Errorf("failed to create profile: %w", err)
	}

	return profile, nil
}

// GetProfileByID retrieves a profile by ID
func (r *ProfileRepository) GetProfileByID(ctx context.Context, id primitive.ObjectID) (*models.Profile, error) {
	var profile models.Profile
	err := r.collection.FindOne(ctx, bson.M{"_id": id, "active": true}).Decode(&profile)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrProfileNotFound
		}
		return nil, fmt.Errorf("failed to get profile: %w", err)
	}

	return &profile, nil
}

// GetProfileBySlug retrieves a profile by slug
func (r *ProfileRepository) GetProfileBySlug(ctx context.Context, slug string) (*models.Profile, error) {
	var profile models.Profile
	err := r.collection.FindOne(ctx, bson.M{"slug": slug, "active": true}).Decode(&profile)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrProfileNotFound
		}
		return nil, fmt.Errorf("failed to get profile: %w", err)
	}

	return &profile, nil
}

// GetAllProfiles retrieves all profiles (active and inactive) for administration
func (r *ProfileRepository) GetAllProfiles(ctx context.Context) ([]*models.Profile, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("failed to get profiles: %w", err)
	}
	defer cursor.Close(ctx)

	var profiles []*models.Profile
	for cursor.Next(ctx) {
		var profile models.Profile
		if err := cursor.Decode(&profile); err != nil {
			return nil, fmt.Errorf("failed to decode profile: %w", err)
		}
		profiles = append(profiles, &profile)
	}

	return profiles, nil
}

// GetActiveProfiles retrieves only active profiles
func (r *ProfileRepository) GetActiveProfiles(ctx context.Context) ([]*models.Profile, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"active": true})
	if err != nil {
		return nil, fmt.Errorf("failed to get active profiles: %w", err)
	}
	defer cursor.Close(ctx)

	var profiles []*models.Profile
	for cursor.Next(ctx) {
		var profile models.Profile
		if err := cursor.Decode(&profile); err != nil {
			return nil, fmt.Errorf("failed to decode profile: %w", err)
		}
		profiles = append(profiles, &profile)
	}

	return profiles, nil
}

// UpdateProfile updates an existing profile
func (r *ProfileRepository) UpdateProfile(ctx context.Context, id primitive.ObjectID, update bson.M, updatedBy primitive.ObjectID) (*models.Profile, error) {
	update["updated_at"] = time.Now()
	update["updated_by"] = updatedBy

	result := r.collection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": id, "active": true},
		bson.M{"$set": update},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	var profile models.Profile
	if err := result.Decode(&profile); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrProfileNotFound
		}
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	return &profile, nil
}

// DeleteProfile soft deletes a profile (sets active to false)
func (r *ProfileRepository) DeleteProfile(ctx context.Context, id primitive.ObjectID, deletedBy primitive.ObjectID) error {
	// Check if profile is a system profile
	var profile models.Profile
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&profile)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return ErrProfileNotFound
		}
		return fmt.Errorf("failed to check profile: %w", err)
	}

	if profile.IsSystem {
		return ErrCannotDeleteSystemProfile
	}

	update := bson.M{
		"active":     false,
		"updated_at": time.Now(),
		"updated_by": deletedBy,
	}

	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": update})
	if err != nil {
		return fmt.Errorf("failed to delete profile: %w", err)
	}

	if result.MatchedCount == 0 {
		return ErrProfileNotFound
	}

	return nil
}

// ProfileExists checks if a profile with the given slug exists
func (r *ProfileRepository) ProfileExists(ctx context.Context, slug string) (bool, error) {
	count, err := r.collection.CountDocuments(ctx, bson.M{"slug": slug, "active": true})
	if err != nil {
		return false, fmt.Errorf("failed to check profile existence: %w", err)
	}

	return count > 0, nil
}

// ExistsByName checks if a profile with the given name exists
func (r *ProfileRepository) ExistsByName(ctx context.Context, name string) (bool, error) {
	count, err := r.collection.CountDocuments(ctx, bson.M{"name": name, "active": true})
	if err != nil {
		return false, fmt.Errorf("failed to check profile name existence: %w", err)
	}

	return count > 0, nil
}

// GetProfilesByRoleID retrieves all profiles that contain a specific role
func (r *ProfileRepository) GetProfilesByRoleID(ctx context.Context, roleID primitive.ObjectID) ([]*models.Profile, error) {
	cursor, err := r.collection.Find(ctx, bson.M{
		"role_ids": roleID,
		"active":   true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get profiles by role: %w", err)
	}
	defer cursor.Close(ctx)

	var profiles []*models.Profile
	for cursor.Next(ctx) {
		var profile models.Profile
		if err := cursor.Decode(&profile); err != nil {
			return nil, fmt.Errorf("failed to decode profile: %w", err)
		}
		profiles = append(profiles, &profile)
	}

	return profiles, nil
}

// InitializeSystemProfiles creates the default system profiles if they don't exist
func (r *ProfileRepository) InitializeSystemProfiles(ctx context.Context) error {
	systemProfiles := []models.Profile{
		{
			Name:        "Administrador del Sistema",
			Slug:        "administrador",
			Description: "Acceso completo al sistema de expedientes militares",
			Permissions: []models.Permission{
				// User permissions
				models.PermissionUserRead,
				models.PermissionUserCreate,
				models.PermissionUserUpdate,
				models.PermissionUserDelete,
				models.PermissionUserManage,
				// Profile permissions
				models.PermissionProfileRead,
				models.PermissionProfileCreate,
				models.PermissionProfileUpdate,
				models.PermissionProfileDelete,
				models.PermissionProfileWrite, // Backward compatibility
				// Expediente permissions
				models.PermissionExpedienteRead,
				models.PermissionExpedienteCreate,
				models.PermissionExpedienteUpdate,
				models.PermissionExpedienteDelete,
				models.PermissionExpedienteManage,
				// System permissions
				models.PermissionSystemRead,
				models.PermissionSystemAdmin,
				// Dashboard permissions
				models.PermissionDashboardView,
				models.PermissionDashboardStats,
				models.PermissionDashboardExport,
			},
			IsSystem: true,
			Active:   true,
		},
	}

	for _, profile := range systemProfiles {
		exists, err := r.ProfileExists(ctx, profile.Slug)
		if err != nil {
			return fmt.Errorf("failed to check if profile exists: %w", err)
		}

		if !exists {
			_, err := r.CreateProfile(ctx, &profile)
			if err != nil {
				return fmt.Errorf("failed to create system profile %s: %w", profile.Slug, err)
			}
		} else {
			// Update existing system profile to ensure it has all required permissions
			err := r.UpdateSystemProfile(ctx, &profile)
			if err != nil {
				return fmt.Errorf("failed to update system profile %s: %w", profile.Slug, err)
			}
		}
	}

	return nil
}

// UpdateSystemProfile updates an existing system profile with new permissions
func (r *ProfileRepository) UpdateSystemProfile(ctx context.Context, profile *models.Profile) error {
	filter := bson.M{"slug": profile.Slug}
	update := bson.M{
		"$set": bson.M{
			"permissions": profile.Permissions,
			"description": profile.Description,
			"updated_at":  time.Now(),
		},
	}

	_, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update system profile: %w", err)
	}

	return nil
}

// CreateIndexes creates necessary indexes for the profiles collection
func (r *ProfileRepository) CreateIndexes(ctx context.Context) error {
	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "slug", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "name", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "active", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "created_at", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "updated_at", Value: 1}},
		},
	}

	_, err := r.collection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		// Log specific error details for debugging
		return fmt.Errorf("failed to create indexes: %w", err)
	}

	return nil
}
