package main

import (
	"context"
	"expedientes-backend/internal/config"
	"expedientes-backend/internal/database"
	"expedientes-backend/internal/handlers"
	"expedientes-backend/internal/middleware"
	"expedientes-backend/internal/models"
	"expedientes-backend/internal/repository"
	"expedientes-backend/internal/services"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const (
	PathHome         = ""
	PathVariableId   = "/:id"
	PathVariableName = "/:name"
)

// logEndpoint creates a middleware that logs endpoint access with custom messages
func logEndpoint(action, description string) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		clientIP := c.ClientIP()
		userID, _ := c.Get("userID")
		userEmail, _ := c.Get("userEmail")

		// Log endpoint access
		if userID != nil {
			log.Printf("%s [%s] %s - Usuario: %s (%s)",
				action, clientIP, description, userEmail, userID)
		} else {
			log.Printf("%s [%s] %s - Usuario: Anónimo",
				action, clientIP, description)
		}

		c.Next()
	})
}

func main() {
	// Load configuration
	cfg := config.Load()

	// Debug: Print CORS configuration
	log.Printf("🌐 CORS Allowed Origins: %v", cfg.CORSAllowedOrigins)
	log.Printf("🚀 Server starting on port: %s", cfg.Port)

	// Connect to database
	db, err := database.Connect(cfg.MongoDBURI, cfg.MongoDBDatabase)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Disconnect()

	// Context for initialization
	ctx := context.Background()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	profileRepo := repository.NewProfileRepository(db.GetMongoDB())
	expedienteRepo := repository.NewExpedienteRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg.JWTSecret, cfg.JWTExpiration)
	profileService := services.NewProfileService(profileRepo)
	userService := services.NewUserServiceWithServices(userRepo, profileService)
	expedienteService := services.NewExpedienteService(expedienteRepo)

	// Initialize database
	if err := initializeDatabase(ctx, db, profileRepo, profileService, userService); err != nil {
		log.Fatalf("❌ Failed to initialize database: %v", err)
	}

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	userHandler := handlers.NewUserHandler(userService)
	profileHandler := handlers.NewProfileHandler(profileService)
	expedienteHandler := handlers.NewExpedienteHandler(expedienteService)
	docsHandler := handlers.NewDocsHandler()

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router
	router := gin.Default()

	// CORS middleware - must be applied before other middleware
	corsConfig := cors.Config{
		AllowOrigins:     cfg.CORSAllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Accept", "X-Requested-With", "Cache-Control"},
		ExposeHeaders:    []string{"Content-Length", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
		AllowWildcard:    false,
	}
	router.Use(cors.New(corsConfig))

	// Additional CORS middleware to ensure headers are always set
	router.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		// Check if origin is in allowed list
		for _, allowedOrigin := range cfg.CORSAllowedOrigins {
			if origin == allowedOrigin {
				c.Header("Access-Control-Allow-Origin", origin)
				break
			}
		}
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Length, Content-Type, Authorization, Accept, X-Requested-With, Cache-Control")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// Custom logging middleware for API endpoints
	router.Use(func(c *gin.Context) {
		// Skip logging for health check to avoid spam
		if c.Request.URL.Path == "/health" {
			c.Next()
			return
		}

		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method
		clientIP := c.ClientIP()
		userAgent := c.Request.UserAgent()

		// Log request start
		log.Printf("🚀 [%s] %s %s - Client: %s - UserAgent: %s",
			method, path, clientIP, clientIP, userAgent)

		c.Next()

		// Log request completion
		statusCode := c.Writer.Status()
		latency := time.Since(start)

		// Choose emoji based on status code
		statusEmoji := "✅"
		if statusCode >= 400 && statusCode < 500 {
			statusEmoji = "⚠️"
		} else if statusCode >= 500 {
			statusEmoji = "❌"
		}

		log.Printf("%s [%s] %s %s - Status: %d - Latency: %v",
			statusEmoji, method, path, clientIP, statusCode, latency)
	}) // Global middleware
	router.Use(middleware.Logger())
	router.Use(middleware.Recovery())
	router.Use(middleware.RateLimit(cfg.RateLimitRequests, cfg.RateLimitWindow))

	// API routes
	v1 := router.Group("/api/v1")
	{
		// Health check endpoint (public)
		v1.GET("/health", logEndpoint("💚 HEALTH", "Verificación de estado del sistema"), func(c *gin.Context) {
			clientIP := c.ClientIP()
			log.Printf("💚 HEALTH-CHECK [%s] - Sistema funcionando correctamente", clientIP)
			c.JSON(http.StatusOK, gin.H{
				"status":    "ok",
				"timestamp": time.Now().UTC(),
				"service":   "expedientes-backend",
			})
		})

		// Auth routes (public)
		auth := v1.Group("/auth")
		{
			auth.POST("/login", logEndpoint("🔐 LOGIN", "Intento de inicio de sesión"), authHandler.Login)
			auth.POST("/refresh", logEndpoint("🔄 REFRESH", "Renovación de token"), authHandler.RefreshToken)
			auth.POST("/logout", logEndpoint("🚪 LOGOUT", "Cierre de sesión"), authHandler.Logout)
		}

		// Documentation routes (public)
		docs := v1.Group("/docs")
		{
			docs.GET(PathHome, logEndpoint("📚 DOCS", "Acceso a documentación Swagger"), docsHandler.GetSwaggerUI)
			docs.GET("/info", logEndpoint("ℹ️ DOCS-INFO", "Información de documentación"), docsHandler.GetDocsInfo)
			docs.GET("/swagger.json", logEndpoint("📄 SWAGGER-JSON", "Descarga de especificación JSON"), docsHandler.GetSwaggerJSON)
			docs.GET("/swagger.yaml", logEndpoint("📄 SWAGGER-YAML", "Descarga de especificación YAML"), docsHandler.GetSwaggerYAML)
		}

		// Protected routes
		protected := v1.Group(PathHome)
		protected.Use(middleware.AuthMiddleware())
		{
			// User routes - Permission-based access control
			users := protected.Group("/users")
			{
				users.GET(PathHome, logEndpoint("👥 USERS-LIST", "Consulta lista de usuarios"), middleware.RequirePermission(models.PermissionUserRead), userHandler.GetUsers)
				users.GET(PathVariableId, logEndpoint("👤 USER-GET", "Consulta usuario específico"), middleware.RequirePermission(models.PermissionUserRead), userHandler.GetUser)
				users.POST(PathHome, logEndpoint("➕ USER-CREATE", "Creación de nuevo usuario"), middleware.RequirePermission(models.PermissionUserCreate), userHandler.CreateUser)
				users.PUT(PathVariableId, logEndpoint("✏️ USER-UPDATE", "Actualización de usuario"), middleware.RequirePermission(models.PermissionUserUpdate), userHandler.UpdateUser)
				users.DELETE(PathVariableId, logEndpoint("🗑️ USER-DELETE", "Eliminación de usuario"), middleware.RequirePermission(models.PermissionUserDelete), userHandler.DeleteUser)
				users.GET("/profile", logEndpoint("👤 PROFILE-GET", "Consulta perfil propio"), userHandler.GetProfile)
				users.PUT("/profile", logEndpoint("✏️ PROFILE-UPDATE", "Actualización perfil propio"), userHandler.UpdateProfile)
				users.PUT("/password", logEndpoint("🔑 PASSWORD-CHANGE", "Cambio de contraseña"), userHandler.ChangePassword)
			}

			// Profile routes - View access for authorized users
			profiles := protected.Group("/profiles")
			{
				profiles.GET(PathHome, logEndpoint("🎭 PROFILES-LIST", "Consulta lista de perfiles"), middleware.RequirePermission(models.PermissionProfileRead), profileHandler.GetProfiles)
				profiles.GET(PathVariableId, logEndpoint("🎭 PROFILE-GET", "Consulta perfil específico"), middleware.RequirePermission(models.PermissionProfileRead), profileHandler.GetProfile)
				profiles.POST(PathHome, logEndpoint("➕ PROFILE-CREATE", "Creación de nuevo perfil"), middleware.RequirePermission(models.PermissionProfileCreate), profileHandler.CreateProfile)
				profiles.PUT(PathVariableId, logEndpoint("✏️ PROFILE-UPDATE", "Actualización de perfil"), middleware.RequirePermission(models.PermissionProfileUpdate), profileHandler.UpdateProfile)
				profiles.DELETE(PathVariableId, logEndpoint("🗑️ PROFILE-DELETE", "Eliminación de perfil"), middleware.RequirePermission(models.PermissionProfileDelete), profileHandler.DeleteProfile)
				profiles.GET("/:id/permissions", logEndpoint("🔐 PROFILE-PERMISSIONS-GET", "Consulta permisos de perfil"), middleware.RequirePermission(models.PermissionProfileRead), profileHandler.GetProfilePermissions)
				profiles.PUT("/:id/permissions", logEndpoint("🔐 PROFILE-PERMISSIONS-UPDATE", "Actualización permisos perfil"), middleware.RequirePermission(models.PermissionProfileUpdate), profileHandler.UpdateProfilePermissions)
			}

			// Permissions route - View available permissions
			permissions := protected.Group("/permissions")
			{
				permissions.GET(PathHome, logEndpoint("🔑 PERMISSIONS-LIST", "Consulta permisos disponibles"), middleware.RequirePermission(models.PermissionProfileRead), profileHandler.GetAllPermissions)
			}

			// Expediente routes - Permission-based access control
			expedientes := protected.Group("/expedientes")
			{
				// Read access - Users with read permission
				expedientes.GET(PathHome, logEndpoint("📂 EXPEDIENTES-LIST", "Consulta lista de expedientes"), middleware.RequirePermission(models.PermissionExpedienteRead), expedienteHandler.GetExpedientes)
				expedientes.GET(PathVariableId, logEndpoint("📄 EXPEDIENTE-GET", "Consulta expediente específico"), middleware.RequirePermission(models.PermissionExpedienteRead), expedienteHandler.GetExpediente)
				expedientes.GET("/search", logEndpoint("🔍 EXPEDIENTES-SEARCH", "Búsqueda de expedientes"), middleware.RequirePermission(models.PermissionExpedienteRead), expedienteHandler.SearchExpedientes)

				// Write access - Users with create/update permission
				expedientes.POST(PathHome, logEndpoint("➕ EXPEDIENTE-CREATE", "Creación de nuevo expediente"), middleware.RequirePermission(models.PermissionExpedienteCreate), expedienteHandler.CreateExpediente)
				expedientes.POST("/bulk-import", logEndpoint("📂 EXPEDIENTES-BULK-IMPORT", "Importación masiva desde Excel"), middleware.RequirePermission(models.PermissionExpedienteCreate), expedienteHandler.BulkImportExpedientes)
				expedientes.PUT(PathVariableId, logEndpoint("✏️ EXPEDIENTE-UPDATE", "Actualización de expediente"), middleware.RequirePermission(models.PermissionExpedienteUpdate), expedienteHandler.UpdateExpediente)
				expedientes.PUT("/:id/estado", logEndpoint("🔄 EXPEDIENTE-STATUS", "Cambio estado expediente"), middleware.RequirePermission(models.PermissionExpedienteUpdate), expedienteHandler.UpdateEstado)

				// Delete access - Users with delete permission
				expedientes.DELETE(PathVariableId, logEndpoint("🗑️ EXPEDIENTE-DELETE", "Eliminación de expediente"), middleware.RequirePermission(models.PermissionExpedienteDelete), expedienteHandler.DeleteExpediente)
			}

			// Dashboard routes - Permission-based access control
			dashboard := protected.Group("/dashboard")
			{
				dashboard.GET("/stats", logEndpoint("📊 DASHBOARD-STATS", "Estadísticas del dashboard"), middleware.RequirePermission(models.PermissionDashboardStats), expedienteHandler.GetDashboardStats)
			}

			// System admin only routes
			admin := protected.Group("/admin")
			admin.Use(middleware.RequirePermission(models.PermissionSystemAdmin))
			{
				admin.GET("/profiles", logEndpoint("🔧 ADMIN-PROFILES", "Administración de perfiles"), profileHandler.GetProfiles)
			}
		}
	}

	// Create HTTP server
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	// Start server
	log.Printf("🚀 Starting server on port %s", cfg.Port)
	log.Printf("📍 Health check available at: http://localhost:%s/api/v1/health", cfg.Port)
	log.Printf("📚 API documentation at: http://localhost:%s/api/v1/docs/", cfg.Port)
	log.Printf("🔑 Available endpoints:")
	log.Printf("   - Health: /api/v1/health")
	log.Printf("   - Authentication: /api/v1/auth/*")
	log.Printf("   - Documentation: /api/v1/docs/*")
	log.Printf("   - Users: /api/v1/users/*")
	log.Printf("   - Profiles: /api/v1/profiles/*")
	log.Printf("   - Permissions: /api/v1/permissions")
	log.Printf("   - Expedientes: /api/v1/expedientes/*")
	log.Printf("   - Dashboard: /api/v1/dashboard/*")
	log.Printf("   - Admin: /api/v1/admin/*")
	log.Println("================================================")

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("🛑 Shutting down server...")
	log.Println("📊 Cerrando conexiones activas...")

	// Create a deadline to wait for
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("❌ Server forced to shutdown:", err)
	}

	log.Println("✅ Server exited gracefully")
	log.Println("👋 ¡Hasta luego!")
}

// initializeDatabase creates indexes and initializes system profiles and users
func initializeDatabase(ctx context.Context, db *database.Database, profileRepo *repository.ProfileRepository, profileService *services.ProfileService, userService *services.UserService) error {
	log.Println("🔧 Initializing database...")

	// Create all database indexes (users, expedientes, profiles)
	if err := db.CreateIndexes(); err != nil {
		log.Printf("⚠️ Warning: Failed to create database indexes: %v", err)
	}

	// Create profile-specific indexes
	if err := profileRepo.CreateIndexes(ctx); err != nil {
		log.Printf("⚠️ Warning: Failed to create profile indexes: %v", err)
	}

	// Initialize system profiles
	if err := profileService.InitializeSystemProfiles(ctx); err != nil {
		return err
	}

	// Initialize system user (admin)
	if err := userService.InitializeSystemUser(ctx); err != nil {
		return err
	}

	log.Println("✅ Database initialization complete")
	return nil
}
