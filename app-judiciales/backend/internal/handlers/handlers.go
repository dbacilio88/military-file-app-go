package handlers

import (
	"context"
	"errors"
	"expedientes-backend/internal/models"
	"expedientes-backend/internal/services"
	"expedientes-backend/internal/utils"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Error message constants
const (
	ErrUserNotAuthenticated = "user not authenticated"
	ErrUserNotFound         = "usuario no encontrado"
	ErrExpedienteNotFound   = "expediente not found"
	ErrInvalidIDFormat      = "invalid ID format"
	ErrInvalidUserID        = "invalid user ID"
)

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	authService *services.AuthService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var loginReq models.UserLogin

	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	authResp, err := h.authService.Login(loginReq.Email, loginReq.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    authResp,
	})
}

// RefreshToken handles token refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var refreshReq models.RefreshTokenRequest

	if err := c.ShouldBindJSON(&refreshReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	authResp, err := h.authService.RefreshToken(refreshReq.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    authResp,
	})
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	// Implement token blacklist in Redis
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logged out successfully",
	})
}

// UserHandler handles user endpoints
type UserHandler struct {
	userService *services.UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetUsers handles getting all users
func (h *UserHandler) GetUsers(c *gin.Context) {
	// simple pagination defaults
	page := 1
	limit := 25

	users, total, err := h.userService.GetAll(page, limit, "", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	// convert to responses
	var resp []models.UserResponse
	for _, u := range users {
		resp = append(resp, u.ToUserResponse())
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp, "total": total})
}

// GetUser handles getting a single user
func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")
	user, err := h.userService.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": ErrUserNotFound})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": user.ToUserResponse()})
}

// CreateUser handles creating a user
func (h *UserHandler) CreateUser(c *gin.Context) {
	var payload models.CreateUserRequest

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	hashed, err := utils.HashPassword(payload.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "error al encriptar contraseña"})
		return
	}

	user := models.User{
		Email:     payload.Email,
		Password:  hashed,
		Nombre:    payload.Nombre,
		Apellido:  payload.Apellido,
		Documento: payload.Documento,
		Telefono:  payload.Telefono,
		Activo:    true,
	}

	if payload.ProfileID != "" {
		if oid, err := primitive.ObjectIDFromHex(payload.ProfileID); err == nil {
			user.ProfileID = oid
		}
	}

	if err := h.userService.Create(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": user.ToUserResponse()})
}

// UpdateUser handles updating a user
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var payload models.UpdateUserRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Convert to updates map
	updates := make(map[string]interface{})

	if payload.Nombre != nil {
		updates["nombre"] = *payload.Nombre
	}
	if payload.Apellido != nil {
		updates["apellido"] = *payload.Apellido
	}
	if payload.Documento != nil {
		updates["documento"] = *payload.Documento
	}
	if payload.Telefono != nil {
		updates["telefono"] = *payload.Telefono
	}
	if payload.ProfileID != nil {
		if oid, err := primitive.ObjectIDFromHex(*payload.ProfileID); err == nil {
			updates["profile_id"] = oid
		}
	}
	if payload.Activo != nil {
		updates["activo"] = *payload.Activo
	}

	if err := h.userService.Update(id, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// DeleteUser handles deleting a user
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := h.userService.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetProfile handles getting user profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   ErrUserNotAuthenticated,
		})
		return
	}

	user, err := h.userService.GetByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   ErrUserNotFound,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user.ToUserResponse(),
	})
}

// UpdateProfile handles updating user profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   ErrUserNotAuthenticated,
		})
		return
	}

	var payload models.UpdateUserProfileRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Convert to updates map
	updates := make(map[string]interface{})

	if payload.Nombre != nil {
		updates["nombre"] = *payload.Nombre
	}
	if payload.Apellido != nil {
		updates["apellido"] = *payload.Apellido
	}
	if payload.Telefono != nil {
		updates["telefono"] = *payload.Telefono
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "no valid fields to update",
		})
		return
	}

	if err := h.userService.Update(userID.(string), updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Get updated user
	user, err := h.userService.GetByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "perfil actualizado exitosamente",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user.ToUserResponse(),
		"message": "perfil actualizado exitosamente",
	})
}

// ChangePassword handles changing user password
func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   ErrUserNotAuthenticated,
		})
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Get current user to verify current password
	user, err := h.userService.GetByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   ErrUserNotFound,
		})
		return
	}

	// Verify current password
	if !utils.CheckPasswordHash(req.CurrentPassword, user.Password) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "contraseña actual incorrecta",
		})
		return
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "error al encriptar nueva contraseña",
		})
		return
	}

	// Update password
	updates := map[string]interface{}{
		"password": hashedPassword,
	}

	if err := h.userService.Update(userID.(string), updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "contraseña actualizada exitosamente",
	})
}

// ProfileHandler handles profile endpoints
type ProfileHandler struct {
	profileService *services.ProfileService
}

// NewProfileHandler creates a new profile handler
func NewProfileHandler(profileService *services.ProfileService) *ProfileHandler {
	return &ProfileHandler{profileService: profileService}
}

// GetProfile handles getting a profile by ID
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	id := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "ID de perfil inválido",
		})
		return
	}

	ctx := context.Background()
	profile, err := h.profileService.GetProfileByID(ctx, objectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "perfil no encontrado",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    profile,
	})
}

// GetProfiles handles getting all profiles
func (h *ProfileHandler) GetProfiles(c *gin.Context) {
	ctx := context.Background()
	profiles, err := h.profileService.GetAllProfiles(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "error al obtener perfiles",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    profiles,
	})
}

// CreateProfile handles creating a new profile
func (h *ProfileHandler) CreateProfile(c *gin.Context) {
	var req models.CreateProfileRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   ErrUserNotAuthenticated,
		})
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   ErrInvalidUserID,
		})
		return
	}

	ctx := context.Background()
	profile, err := h.profileService.CreateProfile(ctx, &req, userObjID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "profile with this name already exists" ||
			err.Error() == "profile with this slug already exists" {
			statusCode = http.StatusConflict
		}
		c.JSON(statusCode, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    profile,
	})
}

// UpdateProfile handles updating a profile
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	id := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "ID de perfil inválido",
		})
		return
	}

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   ErrUserNotAuthenticated,
		})
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   ErrInvalidUserID,
		})
		return
	}

	ctx := context.Background()
	profile, err := h.profileService.UpdateProfile(ctx, objectID, &req, userObjID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "profile not found" {
			statusCode = http.StatusNotFound
		} else if err.Error() == "profile with this name already exists" ||
			err.Error() == "profile with this slug already exists" {
			statusCode = http.StatusConflict
		}
		c.JSON(statusCode, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    profile,
	})
}

// DeleteProfile handles deleting a profile
func (h *ProfileHandler) DeleteProfile(c *gin.Context) {
	id := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "ID de perfil inválido",
		})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   ErrUserNotAuthenticated,
		})
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   ErrInvalidUserID,
		})
		return
	}

	ctx := context.Background()
	if err := h.profileService.DeleteProfile(ctx, objectID, userObjID); err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "profile not found" {
			statusCode = http.StatusNotFound
		} else if err.Error() == "cannot delete system profile" {
			statusCode = http.StatusForbidden
		}
		c.JSON(statusCode, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "perfil eliminado exitosamente",
	})
}

// GetProfilePermissions handles getting permissions for a profile
func (h *ProfileHandler) GetProfilePermissions(c *gin.Context) {
	id := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "ID de perfil inválido",
		})
		return
	}

	ctx := context.Background()
	profile, err := h.profileService.GetProfileByID(ctx, objectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "perfil no encontrado",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"profile_id":   profile.ID,
			"profile_name": profile.Name,
			"permissions":  profile.Permissions,
		},
	})
}

// UpdateProfilePermissions handles updating permissions for a profile
func (h *ProfileHandler) UpdateProfilePermissions(c *gin.Context) {
	id := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "ID de perfil inválido",
		})
		return
	}

	var req models.UpdatePermissionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   ErrUserNotAuthenticated,
		})
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   ErrInvalidUserID,
		})
		return
	}

	ctx := context.Background()
	profile, err := h.profileService.UpdateProfilePermissions(ctx, objectID, req.Permissions, userObjID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "profile not found" {
			statusCode = http.StatusNotFound
		} else if err.Error() == "cannot modify system profile permissions" {
			statusCode = http.StatusForbidden
		}
		c.JSON(statusCode, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    profile,
	})
}

// GetAllPermissions handles getting all available permissions
func (h *ProfileHandler) GetAllPermissions(c *gin.Context) {
	permissions := models.GetAllPermissions()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    permissions,
	})
}

// Other handlers with basic structure
type ExpedienteHandler struct {
	service *services.ExpedienteService
}

func NewExpedienteHandler(service *services.ExpedienteService) *ExpedienteHandler {
	return &ExpedienteHandler{
		service: service,
	}
}
func (h *ExpedienteHandler) GetExpedientes(c *gin.Context) {
	page := 1
	limit := 10
	sortBy := c.DefaultQuery("sort_by", "orden")
	sortOrder := c.DefaultQuery("sort_order", "asc")

	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	expedientes, total, err := h.service.GetAll(page, limit, sortBy, sortOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"expedientes": expedientes,
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": totalPages,
		},
	})
}
func (h *ExpedienteHandler) GetExpediente(c *gin.Context) {
	id := c.Param("id")

	expediente, err := h.service.GetByID(id)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == ErrExpedienteNotFound || err.Error() == ErrInvalidIDFormat {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    expediente,
	})
}
func (h *ExpedienteHandler) CreateExpediente(c *gin.Context) {
	var req models.CreateExpedienteRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   ErrUserNotAuthenticated,
		})
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   ErrInvalidUserID,
		})
		return
	}

	expediente := &models.Expediente{
		Grado:            req.Grado,
		ApellidosNombres: req.ApellidosNombres,
		NumeroPaginas:    req.NumeroPaginas,
		SituacionMilitar: req.SituacionMilitar,
		CIP:              req.CIP,
		Ubicacion:        req.Ubicacion,
		Orden:            req.Orden,
		Ano:              req.Ano,
		CreatedBy:        userObjID,
		UpdatedBy:        userObjID,
	}

	if err := h.service.Create(expediente); err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "expediente with this CIP already exists" {
			statusCode = http.StatusConflict
		}
		c.JSON(statusCode, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    expediente,
	})
}
func (h *ExpedienteHandler) UpdateExpediente(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateExpedienteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	userObjID, err := h.getUserIDFromContext(c)
	if err != nil {
		return // Error already handled in helper
	}

	updates := h.buildUpdateMap(&req, userObjID)
	if len(updates) == 1 { // Only updatedBy
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "no fields to update",
		})
		return
	}

	if err := h.updateExpedienteInService(c, id, updates); err != nil {
		return // Error already handled in helper
	}

	h.respondWithUpdatedExpediente(c, id)
}

// getUserIDFromContext extracts and validates user ID from gin context
func (h *ExpedienteHandler) getUserIDFromContext(c *gin.Context) (primitive.ObjectID, error) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   ErrUserNotAuthenticated,
		})
		return primitive.NilObjectID, errors.New("user not authenticated")
	}

	userObjID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   ErrInvalidUserID,
		})
		return primitive.NilObjectID, err
	}

	return userObjID, nil
}

// buildUpdateMap builds the updates map from request
func (h *ExpedienteHandler) buildUpdateMap(req *models.UpdateExpedienteRequest, userObjID primitive.ObjectID) map[string]interface{} {
	updates := make(map[string]interface{})

	if req.Grado != nil {
		updates["grado"] = *req.Grado
	}
	if req.ApellidosNombres != nil {
		updates["apellidos_nombres"] = *req.ApellidosNombres
	}
	if req.NumeroPaginas != nil {
		updates["numero_paginas"] = *req.NumeroPaginas
	}
	if req.SituacionMilitar != nil {
		updates["situacion_militar"] = *req.SituacionMilitar
	}
	if req.CIP != nil {
		updates["cip"] = *req.CIP
	}
	if req.Estado != nil {
		updates["estado"] = *req.Estado
	}
	if req.Ubicacion != nil {
		updates["ubicacion"] = *req.Ubicacion
	}
	if req.Orden != nil {
		updates["orden"] = *req.Orden
	}
	if req.Ano != nil {
		updates["ano"] = *req.Ano
	}

	updates["updatedBy"] = userObjID
	return updates
}

// updateExpedienteInService updates expediente using service
func (h *ExpedienteHandler) updateExpedienteInService(c *gin.Context, id string, updates map[string]interface{}) error {
	if err := h.service.Update(id, updates); err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == ErrExpedienteNotFound {
			statusCode = http.StatusNotFound
		} else if err.Error() == "expediente with this CIP already exists" {
			statusCode = http.StatusConflict
		}
		c.JSON(statusCode, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return err
	}
	return nil
}

// respondWithUpdatedExpediente sends response with updated expediente data
func (h *ExpedienteHandler) respondWithUpdatedExpediente(c *gin.Context, id string) {
	expediente, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "expediente updated successfully",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    expediente,
	})
}
func (h *ExpedienteHandler) DeleteExpediente(c *gin.Context) {
	id := c.Param("id")

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   ErrUserNotAuthenticated,
		})
		return
	}

	if err := h.service.Delete(id, userID.(string)); err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "expediente not found or already deleted" || err.Error() == ErrInvalidIDFormat {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "expediente deleted successfully",
	})
}
func (h *ExpedienteHandler) UpdateEstado(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Estado models.EstadoExpediente `json:"estado" binding:"required,oneof=dentro fuera"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   ErrUserNotAuthenticated,
		})
		return
	}

	if err := h.service.UpdateEstado(id, req.Estado, userID.(string)); err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == ErrExpedienteNotFound || err.Error() == ErrInvalidIDFormat {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "estado updated successfully",
	})
}
func (h *ExpedienteHandler) SearchExpedientes(c *gin.Context) {
	var params models.ExpedienteSearchParams

	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Set defaults
	if params.Page < 1 {
		params.Page = 1
	}
	if params.Limit < 1 {
		params.Limit = 10
	}
	if params.SortBy == "" {
		params.SortBy = "orden"
	}
	if params.SortOrder == "" {
		params.SortOrder = "asc"
	}

	expedientes, total, err := h.service.Search(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	totalPages := int(total) / params.Limit
	if int(total)%params.Limit > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"expedientes": expedientes,
			"total":       total,
			"page":        params.Page,
			"limit":       params.Limit,
			"total_pages": totalPages,
		},
	})
}

// GetExpedientesByDivision obtiene expedientes de una división específica
func (h *ExpedienteHandler) GetExpedientesByDivision(c *gin.Context) {
	divisionRange := c.Query("range")
	if divisionRange == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "division range is required",
		})
		return
	}

	expedientes, err := h.service.GetExpedientesByDivision(divisionRange)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"expedientes": expedientes,
			"total":       len(expedientes),
			"division":    divisionRange,
		},
	})
}

// ExportExpedientesExcel exports all expedientes (minimal fields) as an Excel file
func (h *ExpedienteHandler) ExportExpedientesExcel(c *gin.Context) {
	// Only authorized users reach this point (route protected by middleware)
	records, err := h.service.ExportAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Create a new Excel file
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			log.Printf("Error closing Excel file: %v", err)
		}
	}()

	sheetName := "Expedientes"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Error creating Excel sheet"})
		return
	}
	f.SetActiveSheet(index)

	// Set headers
	headers := []string{"Grado", "CIP", "ApellidosNombres", "NumeroPaginas", "Ano"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i)
		f.SetCellValue(sheetName, cell, header)
	}

	// Style headers
	headerStyle, err := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"#CCE5FF"}, Pattern: 1},
	})
	if err == nil {
		f.SetCellStyle(sheetName, "A1", fmt.Sprintf("%c1", 'A'+len(headers)-1), headerStyle)
	}

	// Write data
	for i, record := range records {
		row := i + 2 // Start from row 2 (after headers)
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), string(record.Grado))
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), record.CIP)
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), record.ApellidosNombres)
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), record.NumeroPaginas)
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", row), record.Ano)
	}

	// Auto-fit columns
	for i := 0; i < len(headers); i++ {
		col := fmt.Sprintf("%c", 'A'+i)
		f.SetColWidth(sheetName, col, col, 15)
	}

	// Generate filename with timestamp
	filename := fmt.Sprintf("expedientes_export_%s.xlsx", time.Now().Format("20060102_150405"))

	// Set headers for Excel download
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Status(http.StatusOK)

	// Write Excel file to response
	if err := f.Write(c.Writer); err != nil {
		log.Printf("Error writing Excel file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Error generating Excel file"})
		return
	}
}

// BulkImportExpedientes handles bulk import of expedientes from Excel file
func (h *ExpedienteHandler) BulkImportExpedientes(c *gin.Context) {
	// Get user ID from context
	userObjID, err := h.getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "Usuario no autenticado",
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Archivo requerido. Use el campo 'file' para subir el archivo Excel",
		})
		return
	}

	// Validate file extension
	if !isExcelFile(file.Filename) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "El archivo debe ser de tipo Excel (.xlsx o .xls)",
		})
		return
	}

	// Validate file size (max 10MB)
	if file.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "El archivo no puede ser mayor a 10MB",
		})
		return
	}

	// Process bulk import
	result, err := h.service.BulkImportFromExcel(file, userObjID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Determine response status based on results
	statusCode := http.StatusOK
	if result.Exitosos == 0 {
		statusCode = http.StatusBadRequest
	} else if result.Fallidos > 0 {
		statusCode = http.StatusPartialContent // 206 for partial success
	}

	c.JSON(statusCode, gin.H{
		"success": result.Exitosos > 0,
		"data":    result,
		"message": generateImportSummaryMessage(result),
	})
}

// isExcelFile checks if the file has a valid Excel extension
func isExcelFile(filename string) bool {
	if len(filename) < 4 {
		return false
	}
	ext := filename[len(filename)-4:]
	return ext == ".xls" || filename[len(filename)-5:] == ".xlsx"
}

// generateImportSummaryMessage generates a summary message for the import result
func generateImportSummaryMessage(result *models.BulkImportResult) string {
	if result.Exitosos == 0 {
		return "No se pudieron importar expedientes. Revise los errores y corrija el archivo Excel."
	}

	if result.Fallidos == 0 {
		return "Todos los expedientes fueron importados exitosamente."
	}

	return "Importación parcial completada. Algunos registros tuvieron errores."
}

// GetDashboardStats handles GET /api/v1/expedientes/dashboard/stats
// @Summary Get comprehensive dashboard statistics
// @Description Retrieve detailed statistics for the dashboard including counts by grade, status, location, and temporal data
// @Tags Dashboard
// @Produce json
// @Success 200 {object} models.DashboardStats
// @Failure 401 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /api/v1/expedientes/dashboard/stats [get]
// @Security ApiKeyAuth
func (h *ExpedienteHandler) GetDashboardStats(c *gin.Context) {
	log.Printf("📊 Getting dashboard statistics...")

	// Get dashboard statistics
	stats, err := h.service.GetDashboardStats()
	if err != nil {
		log.Printf("❌ Error getting dashboard stats: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Error retrieving dashboard statistics",
			Error: &models.APIError{
				Code:    "STATS_ERROR",
				Message: err.Error(),
			},
		})
		return
	}

	log.Printf("✅ Dashboard statistics retrieved successfully")
	log.Printf("📈 Total expedientes: %d", stats.ResumenGeneral.TotalExpedientes)
	log.Printf("📍 Ubicaciones únicas: %d", stats.ResumenGeneral.UbicacionesUnicas)
	log.Printf("📊 Grados analizados: %d", len(stats.EstadisticasPorGrado))

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Dashboard statistics retrieved successfully",
		Data:    stats,
	})
}
