package handlers

import (
	"expedientes-backend/internal/models"
	"expedientes-backend/internal/repository"
	"expedientes-backend/internal/services"
	"expedientes-backend/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
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
	// TODO: Implement token blacklist in Redis
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
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "usuario no encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": user.ToUserResponse()})
}

// CreateUser handles creating a user
func (h *UserHandler) CreateUser(c *gin.Context) {
	var payload struct {
		Email     string   `json:"email" binding:"required,email"`
		Password  string   `json:"password" binding:"required,min=6"`
		Nombre    string   `json:"nombre" binding:"required"`
		Apellido  string   `json:"apellido" binding:"required"`
		Documento string   `json:"documento" binding:"required"`
		Telefono  string   `json:"telefono"`
		ProfileID string   `json:"profile_id"`
		Roles     []string `json:"roles"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	hashed, err := utils.HashPassword(payload.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "error al encriptar contrase�a"})
		return
	}

	user := &models.User{
		Email:     payload.Email,
		Password:  hashed,
		Nombre:    payload.Nombre,
		Apellido:  payload.Apellido,
		Documento: payload.Documento,
		Telefono:  payload.Telefono,
		Roles:     payload.Roles,
		Activo:    true,
	}

	if payload.ProfileID != "" {
		if oid, err := primitive.ObjectIDFromHex(payload.ProfileID); err == nil {
			user.ProfileID = oid
		}
	}

	if err := h.userService.Create(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": user.ToUserResponse()})
}

// UpdateUser handles updating a user
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	// prevent password updates here (use ChangePassword endpoint)
	delete(updates, "password")

	if profileID, ok := updates["profile_id"].(string); ok && profileID != "" {
		if oid, err := primitive.ObjectIDFromHex(profileID); err == nil {
			updates["profile_id"] = oid
		} else {
			delete(updates, "profile_id")
		}
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
	c.JSON(http.StatusOK, gin.H{"message": "Get profile endpoint"})
}

// UpdateProfile handles updating user profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Update profile endpoint"})
}

// ChangePassword handles changing user password
func (h *UserHandler) ChangePassword(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Change password endpoint"})
}

// ProfileHandler handles profile endpoints
type ProfileHandler struct {
	profileRepo *repository.ProfileRepository
}

// NewProfileHandler creates a new profile handler
func NewProfileHandler(profileRepo *repository.ProfileRepository) *ProfileHandler {
	return &ProfileHandler{profileRepo: profileRepo}
}

// GetProfile handles getting a profile by ID
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	id := c.Param("id")

	profile, err := h.profileRepo.GetByID(id)
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
	profiles, err := h.profileRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    profiles,
	})
}

// Other handlers with basic structure
type ExpedienteHandler struct{}

func NewExpedienteHandler(service *services.ExpedienteService) *ExpedienteHandler {
	return &ExpedienteHandler{}
}
func (h *ExpedienteHandler) GetExpedientes(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Get expedientes"})
}
func (h *ExpedienteHandler) GetExpediente(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Get expediente"})
}
func (h *ExpedienteHandler) CreateExpediente(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Create expediente"})
}
func (h *ExpedienteHandler) UpdateExpediente(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Update expediente"})
}
func (h *ExpedienteHandler) DeleteExpediente(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Delete expediente"})
}
func (h *ExpedienteHandler) UpdateEstado(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Update estado"})
}
func (h *ExpedienteHandler) SearchExpedientes(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Search expedientes"})
}

type MovimientoHandler struct{}

func NewMovimientoHandler(service *services.MovimientoService) *MovimientoHandler {
	return &MovimientoHandler{}
}
func (h *MovimientoHandler) GetMovimientosByExpediente(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Get movimientos by expediente"})
}
func (h *MovimientoHandler) GetMovimiento(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Get movimiento"})
}
func (h *MovimientoHandler) CreateMovimiento(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Create movimiento"})
}
func (h *MovimientoHandler) UpdateMovimiento(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Update movimiento"})
}
func (h *MovimientoHandler) DeleteMovimiento(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Delete movimiento"})
}

type JuzgadoHandler struct{}

func NewJuzgadoHandler(service *services.JuzgadoService) *JuzgadoHandler { return &JuzgadoHandler{} }
func (h *JuzgadoHandler) GetJuzgados(c *gin.Context)                     { c.JSON(200, gin.H{"message": "Get juzgados"}) }
func (h *JuzgadoHandler) GetJuzgado(c *gin.Context)                      { c.JSON(200, gin.H{"message": "Get juzgado"}) }
func (h *JuzgadoHandler) CreateJuzgado(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Create juzgado"})
}
func (h *JuzgadoHandler) UpdateJuzgado(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Update juzgado"})
}
func (h *JuzgadoHandler) DeleteJuzgado(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Delete juzgado"})
}

// GetDashboardStats returns dashboard statistics
func GetDashboardStats(expedienteService *services.ExpedienteService, movimientoService *services.MovimientoService) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Dashboard stats endpoint"})
	}
}



