package middleware

import (
	"context"
	"errors"
	"expedientes-backend/internal/models"
	"expedientes-backend/internal/repository"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	errRoleNotFoundInContext            = "Rol de usuario no encontrado en el contexto"
	errInsufficientPermissions          = "El usuario no tiene los permisos requeridos"
	errInsufficientPermissionsOperation = "El usuario no tiene los permisos requeridos para esta operación"
	errInsufficientRoles                = "El usuario no tiene los roles requeridos"
)

// Global repository for permission checking
var profileRepository *repository.ProfileRepository

// SetProfileRepository sets the profile repository for permission checking
func SetProfileRepository(repo *repository.ProfileRepository) {
	profileRepository = repo
}

type Claims struct {
	UserID    string   `json:"user_id"`
	Email     string   `json:"email"`
	Roles     []string `json:"roles"`
	ProfileID string   `json:"profile_id"`
	jwt.RegisteredClaims
}

// AuthMiddleware validates JWT token
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip authentication for OPTIONS requests (CORS preflight)
		if c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		secretKey := getJWTSecret()

		tokenString, err := extractTokenFromHeader(c)
		if err != nil {
			respondWithAuthError(c, "UNAUTHORIZED", "Encabezado de autorización requerido")
			return
		}

		claims, err := validateToken(tokenString, secretKey)
		if err != nil {
			respondWithAuthError(c, "INVALID_TOKEN", "Token inválido o expirado")
			return
		}

		if isTokenExpired(claims) {
			respondWithAuthError(c, "TOKEN_EXPIRED", "El token ha expirado")
			return
		}

		setUserContext(c, claims)
		c.Next()
	}
}

// getJWTSecret retrieves JWT secret from environment
func getJWTSecret() string {
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		log.Fatalf("JWT_SECRET environment variable is required")
	}
	return secretKey
}

// extractTokenFromHeader extracts token from Authorization header
func extractTokenFromHeader(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return "", errors.New("missing authorization header")
	}

	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		respondWithAuthError(c, "INVALID_TOKEN_FORMAT", "Formato de encabezado de autorización inválido")
		return "", errors.New("invalid token format")
	}

	return tokenParts[1], nil
}

// validateToken parses and validates JWT token
func validateToken(tokenString, secretKey string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid claims")
}

// isTokenExpired checks if token is expired
func isTokenExpired(claims *Claims) bool {
	return claims.ExpiresAt.Time.Before(time.Now())
}

// setUserContext sets user information in gin context
func setUserContext(c *gin.Context, claims *Claims) {
	c.Set("userID", claims.UserID)
	c.Set("userEmail", claims.Email)
	c.Set("userRoles", claims.Roles)
	c.Set("userProfileID", claims.ProfileID)
}

// respondWithAuthError sends authentication error response
func respondWithAuthError(c *gin.Context, code, message string) {
	c.JSON(http.StatusUnauthorized, gin.H{
		"success": false,
		"error": gin.H{
			"code":    code,
			"message": message,
		},
	})
	c.Abort()
}

// RequireRole middleware checks if user has required role
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRoles, err := getUserRolesFromContext(c)
		if err != nil {
			respondWithForbiddenError(c, "ROLE_NOT_FOUND", errRoleNotFoundInContext)
			return
		}

		if !hasRequiredRole(userRoles, roles) {
			respondWithForbiddenError(c, "INSUFFICIENT_PERMISSIONS", errInsufficientPermissions)
			return
		}

		c.Next()
	}
}

// getUserRolesFromContext extracts user roles from gin context
func getUserRolesFromContext(c *gin.Context) ([]string, error) {
	userRoles, exists := c.Get("userRoles")
	if !exists {
		return nil, errors.New("roles not found in context")
	}

	roleSlice, ok := userRoles.([]string)
	if !ok {
		return nil, errors.New("invalid roles format")
	}

	return roleSlice, nil
}

// hasRequiredRole checks if user has any of the required roles
func hasRequiredRole(userRoles, requiredRoles []string) bool {
	for _, required := range requiredRoles {
		for _, userRole := range userRoles {
			if userRole == required {
				return true
			}
		}
	}
	return false
}

// respondWithForbiddenError sends forbidden error response
func respondWithForbiddenError(c *gin.Context, code, message string) {
	c.JSON(http.StatusForbidden, gin.H{
		"success": false,
		"error": gin.H{
			"code":    code,
			"message": message,
		},
	})
	c.Abort()
}

// RequirePermission middleware checks if user has required permission
func RequirePermission(permission models.Permission) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip permission check for OPTIONS requests (CORS preflight)
		if c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		// Get user profile ID from context
		userProfileIDStr, exists := c.Get("userProfileID")
		if !exists || userProfileIDStr == "" {
			respondWithForbiddenError(c, "PROFILE_NOT_FOUND", "Perfil de usuario no encontrado")
			return
		}

		// Convert profile ID string to ObjectID
		profileID, err := primitive.ObjectIDFromHex(userProfileIDStr.(string))
		if err != nil {
			respondWithForbiddenError(c, "INVALID_PROFILE_ID", "ID de perfil inválido")
			return
		}

		// Check if user has the required permission
		hasPermission, err := checkUserPermission(profileID, permission)
		if err != nil {
			log.Printf("Error checking permissions for profile %s: %v", profileID.Hex(), err)
			respondWithForbiddenError(c, "PERMISSION_CHECK_ERROR", "Error verificando permisos")
			return
		}

		if !hasPermission {
			respondWithForbiddenError(c, "INSUFFICIENT_PERMISSIONS", errInsufficientPermissionsOperation)
			return
		}

		c.Next()
	}
}

// checkUserPermission checks if a user profile has a specific permission
func checkUserPermission(profileID primitive.ObjectID, requiredPermission models.Permission) (bool, error) {
	if profileRepository == nil {
		log.Printf("Profile repository not initialized")
		return false, errors.New("profile repository not initialized")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get the user's profile
	profile, err := profileRepository.GetProfileByID(ctx, profileID)
	if err != nil {
		return false, err
	}

	if profile == nil {
		return false, errors.New("profile not found")
	}

	// Check if profile is active
	if !profile.Active {
		return false, errors.New("profile is inactive")
	}

	// Check if the required permission exists in the profile's permissions
	for _, permission := range profile.Permissions {
		if permission == requiredPermission {
			return true, nil
		}
	}

	// Special case: system admin has all permissions
	for _, permission := range profile.Permissions {
		if permission == models.PermissionSystemAdmin {
			return true, nil
		}
	}

	return false, nil
}

// RequirePermissionLegacy middleware checks if user has required permission using memory (backward compatibility)
func RequirePermissionLegacy(permission models.Permission) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRoles, err := getUserRolesFromContext(c)
		if err != nil {
			respondWithForbiddenError(c, "ROLE_NOT_FOUND", errRoleNotFoundInContext)
			return
		}

		if !models.HasPermission(userRoles, permission) {
			respondWithForbiddenError(c, "INSUFFICIENT_PERMISSIONS",
				errInsufficientPermissionsOperation)
			return
		}

		c.Next()
	}
}

// RequireAnyRole middleware checks if user has any of the required roles (legacy support)
func RequireAnyRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRoles, err := getUserRolesFromContext(c)
		if err != nil {
			respondWithForbiddenError(c, "ROLE_NOT_FOUND", errRoleNotFoundInContext)
			return
		}

		if !models.HasAnyRole(userRoles, roles) {
			respondWithForbiddenError(c, "INSUFFICIENT_PERMISSIONS", errInsufficientRoles)
			return
		}

		c.Next()
	}
}
