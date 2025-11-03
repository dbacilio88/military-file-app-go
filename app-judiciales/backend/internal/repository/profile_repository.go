package repository

import (
	"context"
	"expedientes-backend/internal/database"
	"expedientes-backend/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// ProfileRepository handles profile data operations
type ProfileRepository struct {
	collection *mongo.Collection
}

// NewProfileRepository creates a new profile repository
func NewProfileRepository(db *database.Database) *ProfileRepository {
	return &ProfileRepository{
		collection: db.Collection("profiles"),
	}
}

// GetByID retrieves a profile by ID
func (r *ProfileRepository) GetByID(id string) (*models.Profile, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var profile models.Profile
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = r.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&profile)
	if err != nil {
		return nil, err
	}

	return &profile, nil
}

// GetAll retrieves all profiles
func (r *ProfileRepository) GetAll() ([]models.Profile, error) {
	var profiles []models.Profile
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := r.collection.Find(ctx, bson.M{"active": true})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &profiles); err != nil {
		return nil, err
	}

	return profiles, nil
}

// GetBySlug retrieves a profile by slug
func (r *ProfileRepository) GetBySlug(slug string) (*models.Profile, error) {
	var profile models.Profile
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := r.collection.FindOne(ctx, bson.M{"slug": slug}).Decode(&profile)
	if err != nil {
		return nil, err
	}

	return &profile, nil
}

// Create creates a new profile
func (r *ProfileRepository) Create(profile *models.Profile) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	profile.ID = primitive.NewObjectID()
	profile.CreatedAt = time.Now()
	profile.UpdatedAt = time.Now()

	_, err := r.collection.InsertOne(ctx, profile)
	return err
}

// Update updates an existing profile
func (r *ProfileRepository) Update(id string, profile *models.Profile) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	profile.UpdatedAt = time.Now()
	update := bson.M{
		"$set": bson.M{
			"name":       profile.Name,
			"slug":       profile.Slug,
			"roles":      profile.Roles,
			"active":     profile.Active,
			"updated_at": profile.UpdatedAt,
		},
	}

	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	return err
}

// Delete deletes a profile
func (r *ProfileRepository) Delete(id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	return err
}
