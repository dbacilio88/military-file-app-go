package services

import (
	"expedientes-backend/internal/models"
	"expedientes-backend/internal/repository"
)

// UserService handles user business logic
type UserService struct {
	userRepo *repository.UserRepository
}

// NewUserService creates a new user service
func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// GetAll returns all users with pagination
func (s *UserService) GetAll(page, limit int, sortBy, sortOrder string) ([]*models.User, int64, error) {
	return s.userRepo.GetAll(page, limit, sortBy, sortOrder)
}

// Create creates a new user (password should already be hashed by caller)
func (s *UserService) Create(user *models.User) error {
	return s.userRepo.Create(user)
}

// GetByID returns a user by ID
func (s *UserService) GetByID(id string) (*models.User, error) {
	return s.userRepo.GetByID(id)
}

// GetByEmail returns a user by email
func (s *UserService) GetByEmail(email string) (*models.User, error) {
	return s.userRepo.GetByEmail(email)
}

// Update updates a user
func (s *UserService) Update(id string, updates map[string]interface{}) error {
	return s.userRepo.Update(id, updates)
}

// Delete soft-deletes a user
func (s *UserService) Delete(id string) error {
	return s.userRepo.Delete(id)
}

// ExpedienteService handles expediente business logic
type ExpedienteService struct {
	// Add repository when created
}

// NewExpedienteService creates a new expediente service
func NewExpedienteService(expedienteRepo interface{}) *ExpedienteService {
	return &ExpedienteService{}
}

// MovimientoService handles movimiento business logic
type MovimientoService struct {
	// Add repository when created
}

// NewMovimientoService creates a new movimiento service
func NewMovimientoService(movimientoRepo interface{}) *MovimientoService {
	return &MovimientoService{}
}

// JuzgadoService handles juzgado business logic
type JuzgadoService struct {
	// Add repository when created
}

// NewJuzgadoService creates a new juzgado service
func NewJuzgadoService(juzgadoRepo interface{}) *JuzgadoService {
	return &JuzgadoService{}
}
