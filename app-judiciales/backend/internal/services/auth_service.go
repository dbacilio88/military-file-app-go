package services

import (
	"errors"
	"expedientes-backend/internal/models"
	"expedientes-backend/internal/repository"
	"expedientes-backend/internal/utils"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// AuthService handles authentication logic
type AuthService struct {
	userRepo      *repository.UserRepository
	jwtSecret     string
	jwtExpiration time.Duration
}

// NewAuthService creates a new auth service
func NewAuthService(userRepo *repository.UserRepository, jwtSecret string, jwtExpiration time.Duration) *AuthService {
	return &AuthService{
		userRepo:      userRepo,
		jwtSecret:     jwtSecret,
		jwtExpiration: jwtExpiration,
	}
}

// Login authenticates a user and returns tokens
func (s *AuthService) Login(email, password string) (*models.AuthResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return nil, errors.New("credenciales inválidas")
	}

	// Check if user is active
	if !user.Activo {
		return nil, errors.New("cuenta deshabilitada")
	}

	// Verify password
	if !utils.CheckPasswordHash(password, user.Password) {
		return nil, errors.New("credenciales inválidas")
	}

	// Generate tokens
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateRefreshToken(user)
	if err != nil {
		return nil, err
	}

	// Calculate expiration
	expiresAt := time.Now().Add(s.jwtExpiration)

	return &models.AuthResponse{
		User:         user.ToUserResponse(),
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
	}, nil
}

// RefreshToken generates a new access token from a refresh token
func (s *AuthService) RefreshToken(refreshTokenString string) (*models.AuthResponse, error) {
	// Parse refresh token
	token, err := jwt.ParseWithClaims(refreshTokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, errors.New("token de actualización inválido")
	}

	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok || !token.Valid {
		return nil, errors.New("token de actualización inválido")
	}

	// Get user by ID from claims
	user, err := s.userRepo.GetByID(claims.Subject)
	if err != nil {
		return nil, errors.New("usuario no encontrado")
	}

	// Check if user is still active
	if !user.Activo {
		return nil, errors.New("cuenta deshabilitada")
	}

	// Generate new access token
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	// Generate new refresh token
	newRefreshToken, err := s.generateRefreshToken(user)
	if err != nil {
		return nil, err
	}

	expiresAt := time.Now().Add(s.jwtExpiration)

	return &models.AuthResponse{
		User:         user.ToUserResponse(),
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresAt:    expiresAt,
	}, nil
}

// generateAccessToken generates a JWT access token
func (s *AuthService) generateAccessToken(user *models.User) (string, error) {
	// include explicit roles and profile id in token claims
	profileID := ""
	if !user.ProfileID.IsZero() {
		profileID = user.ProfileID.Hex()
	}

	claims := jwt.MapClaims{
		"user_id":    user.ID.Hex(),
		"email":      user.Email,
		"roles":      user.Roles,
		"profile_id": profileID,
		"exp":        time.Now().Add(s.jwtExpiration).Unix(),
		"iat":        time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

// generateRefreshToken generates a JWT refresh token
func (s *AuthService) generateRefreshToken(user *models.User) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   user.ID.Hex(),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(168 * time.Hour)), // 7 days
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
