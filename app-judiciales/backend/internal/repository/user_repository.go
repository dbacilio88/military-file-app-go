package repository

import (
	"context"
	"errors"
	"expedientes-backend/internal/database"
	"expedientes-backend/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// UserRepository handles user data operations
type UserRepository struct {
	db         *database.Database
	collection *mongo.Collection
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *database.Database) *UserRepository {
	return &UserRepository{
		db:         db,
		collection: db.Collection("users"),
	}
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	user.ID = primitive.NewObjectID()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	user.Activo = true

	// ensure roles slice is not nil
	if user.Roles == nil {
		user.Roles = []string{}
	}

	_, err := r.collection.InsertOne(context.Background(), user)
	return err
}

// GetByID gets a user by ID
func (r *UserRepository) GetByID(id string) (*models.User, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var user models.User
	err = r.collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("usuario no encontrado")
		}
		return nil, err
	}

	return &user, nil
}

// GetByEmail gets a user by email
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.collection.FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("usuario no encontrado")
		}
		return nil, err
	}

	return &user, nil
}

// GetAll gets all users with pagination
func (r *UserRepository) GetAll(page, limit int, sortBy, sortOrder string) ([]*models.User, int64, error) {
	ctx := context.Background()

	// Count total documents
	total, err := r.collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, 0, err
	}

	// Calculate skip
	skip := (page - 1) * limit

	// Sort options
	sortValue := 1
	if sortOrder == "desc" {
		sortValue = -1
	}
	if sortBy == "" {
		sortBy = "created_at"
	}

	// Find options
	findOptions := options.Find()
	findOptions.SetSkip(int64(skip))
	findOptions.SetLimit(int64(limit))
	findOptions.SetSort(bson.M{sortBy: sortValue})

	cursor, err := r.collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var users []*models.User
	for cursor.Next(ctx) {
		var user models.User
		if err := cursor.Decode(&user); err != nil {
			return nil, 0, err
		}
		users = append(users, &user)
	}

	return users, total, nil
}

// Update updates a user
func (r *UserRepository) Update(id string, updates bson.M) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	updates["updated_at"] = time.Now()

	result, err := r.collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
		bson.M{"$set": updates},
	)

	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("usuario no encontrado")
	}

	return nil
}

// Delete deletes a user (soft delete by setting activo to false)
func (r *UserRepository) Delete(id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	result, err := r.collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
		bson.M{"$set": bson.M{"activo": false, "updated_at": time.Now()}},
	)

	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("usuario no encontrado")
	}

	return nil
}

// ExistsByEmail checks if a user with the given email exists
func (r *UserRepository) ExistsByEmail(email string) (bool, error) {
	count, err := r.collection.CountDocuments(context.Background(), bson.M{"email": email})
	return count > 0, err
}

// ExistsByDocument checks if a user with the given document exists
func (r *UserRepository) ExistsByDocument(document string) (bool, error) {
	count, err := r.collection.CountDocuments(context.Background(), bson.M{"documento": document})
	return count > 0, err
}

// GetByRole gets users by role
func (r *UserRepository) GetByRole(role string) ([]*models.User, error) {
	cursor, err := r.collection.Find(context.Background(), bson.M{"roles": role, "activo": true})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var users []*models.User
	for cursor.Next(context.Background()) {
		var user models.User
		if err := cursor.Decode(&user); err != nil {
			return nil, err
		}
		users = append(users, &user)
	}

	return users, nil
}

