package services

import (
	"context"
	"errors"
	"fmt"

	"expedientes-backend/internal/models"
	"expedientes-backend/internal/repository"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ProfileService handles profile management operations with direct permissions
type ProfileService struct {
	profileRepo *repository.ProfileRepository
}

// NewProfileService creates a new profile service
func NewProfileService(profileRepo *repository.ProfileRepository) *ProfileService {
	return &ProfileService{
		profileRepo: profileRepo,
	}
}

// CreateProfile creates a new profile with direct permissions
func (s *ProfileService) CreateProfile(ctx context.Context, req *models.CreateProfileRequest, createdBy primitive.ObjectID) (*models.Profile, error) {
	// Check if profile name already exists
	exists, err := s.profileRepo.ExistsByName(ctx, req.Name)
	if err != nil {
		return nil, fmt.Errorf("failed to check profile name existence: %w", err)
	}
	if exists {
		return nil, errors.New("ya existe un perfil con este nombre")
	}

	// Check if profile slug already exists
	exists, err = s.profileRepo.ProfileExists(ctx, req.Slug)
	if err != nil {
		return nil, fmt.Errorf("failed to check profile slug existence: %w", err)
	}
	if exists {
		return nil, errors.New("ya existe un perfil con este slug")
	}

	profile := &models.Profile{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		Permissions: req.Permissions,
		IsSystem:    false,
		Active:      true,
		CreatedBy:   createdBy,
		UpdatedBy:   createdBy,
	}

	return s.profileRepo.CreateProfile(ctx, profile)
}

// GetProfileByID retrieves a profile by ID with role details
func (s *ProfileService) GetProfileByID(ctx context.Context, id primitive.ObjectID) (*models.ProfileResponse, error) {
	profile, err := s.profileRepo.GetProfileByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return s.enrichProfileResponse(profile)
}

// GetProfileBySlug retrieves a profile by slug with role details
func (s *ProfileService) GetProfileBySlug(ctx context.Context, slug string) (*models.ProfileResponse, error) {
	profile, err := s.profileRepo.GetProfileBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	return s.enrichProfileResponse(profile)
}

// GetAllProfiles retrieves all active profiles with role details
func (s *ProfileService) GetAllProfiles(ctx context.Context) ([]*models.ProfileResponse, error) {
	profiles, err := s.profileRepo.GetAllProfiles(ctx)
	if err != nil {
		return nil, err
	}

	var responses []*models.ProfileResponse
	for _, profile := range profiles {
		response, err := s.enrichProfileResponse(profile)
		if err != nil {
			// Log error but continue with other profiles
			continue
		}
		responses = append(responses, response)
	}

	return responses, nil
}

// UpdateProfile updates an existing profile
func (s *ProfileService) UpdateProfile(ctx context.Context, id primitive.ObjectID, req *models.UpdateProfileRequest, updatedBy primitive.ObjectID) (*models.ProfileResponse, error) {
	// Get current profile to check if it exists and is not system profile for certain operations
	currentProfile, err := s.profileRepo.GetProfileByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Check if name is being updated and if it's unique
	if req.Name != "" && req.Name != currentProfile.Name {
		exists, err := s.profileRepo.ExistsByName(ctx, req.Name)
		if err != nil {
			return nil, fmt.Errorf("failed to check profile name existence: %w", err)
		}
		if exists {
			return nil, errors.New("ya existe un perfil con este nombre")
		}
	}

	update := s.buildUpdateMap(req)

	// Handle direct permissions updates
	if req.Permissions != nil {
		update["permissions"] = req.Permissions
	}

	// Handle active status updates
	if req.Active != nil {
		if err := s.validateActiveStatusUpdate(currentProfile, *req.Active); err != nil {
			return nil, err
		}
		update["active"] = *req.Active
	}

	if len(update) == 0 {
		return s.enrichProfileResponse(currentProfile)
	}

	updatedProfile, err := s.profileRepo.UpdateProfile(ctx, id, update, updatedBy)
	if err != nil {
		return nil, err
	}

	return s.enrichProfileResponse(updatedProfile)
}

// buildUpdateMap creates the update map for basic profile fields
func (s *ProfileService) buildUpdateMap(req *models.UpdateProfileRequest) bson.M {
	update := bson.M{}

	if req.Name != "" {
		update["name"] = req.Name
	}

	if req.Description != "" {
		update["description"] = req.Description
	}

	return update
}

// validateActiveStatusUpdate validates active status changes for system profiles
func (s *ProfileService) validateActiveStatusUpdate(profile *models.Profile, newActive bool) error {
	if profile.IsSystem && !newActive {
		return errors.New("cannot deactivate system profile")
	}
	return nil
}

// DeleteProfile deletes a profile (soft delete)
func (s *ProfileService) DeleteProfile(ctx context.Context, id primitive.ObjectID, deletedBy primitive.ObjectID) error {
	// Get current profile to check if it exists and is not system profile
	currentProfile, err := s.profileRepo.GetProfileByID(ctx, id)
	if err != nil {
		return err
	}

	if currentProfile.IsSystem {
		return errors.New("cannot delete system profile")
	}

	return s.profileRepo.DeleteProfile(ctx, id, deletedBy)
}

// UpdateProfilePermissions updates only the permissions of a profile
func (s *ProfileService) UpdateProfilePermissions(ctx context.Context, id primitive.ObjectID, permissions []models.Permission, updatedBy primitive.ObjectID) (*models.ProfileResponse, error) {
	// Get current profile to check if it exists
	currentProfile, err := s.profileRepo.GetProfileByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if currentProfile.IsSystem {
		return nil, errors.New("cannot modify system profile permissions")
	}

	update := bson.M{
		"permissions": permissions,
	}

	updatedProfile, err := s.profileRepo.UpdateProfile(ctx, id, update, updatedBy)
	if err != nil {
		return nil, err
	}

	return s.enrichProfileResponse(updatedProfile)
}

// GetProfileEffectivePermissions returns all permissions for a profile
func (s *ProfileService) GetProfileEffectivePermissions(ctx context.Context, profileID primitive.ObjectID) ([]models.Permission, error) {
	profile, err := s.profileRepo.GetProfileByID(ctx, profileID)
	if err != nil {
		return nil, err
	}

	return profile.Permissions, nil
}

// GetUserEffectivePermissions returns all effective permissions for a user from their profile
func (s *ProfileService) GetUserEffectivePermissions(ctx context.Context, user *models.User) ([]models.Permission, error) {
	// Get permissions from user's profile
	if user.ProfileID.IsZero() {
		return []models.Permission{}, nil
	}

	return s.GetProfileEffectivePermissions(ctx, user.ProfileID)
}

// InitializeSystemProfiles creates default system profiles if they don't exist
func (s *ProfileService) InitializeSystemProfiles(ctx context.Context) error {
	return s.profileRepo.InitializeSystemProfiles(ctx)
}

// enrichProfileResponse adds permissions to profile response
func (s *ProfileService) enrichProfileResponse(profile *models.Profile) (*models.ProfileResponse, error) {
	response := profile.ToProfileResponse()
	response.Permissions = profile.Permissions
	return &response, nil
}

// HasPermission checks if a profile has a specific permission
func (s *ProfileService) HasPermission(ctx context.Context, profileID primitive.ObjectID, permission models.Permission) (bool, error) {
	effectivePermissions, err := s.GetProfileEffectivePermissions(ctx, profileID)
	if err != nil {
		return false, err
	}

	// Check exact match
	for _, p := range effectivePermissions {
		if p == permission {
			return true, nil
		}
	}

	return false, nil
}
