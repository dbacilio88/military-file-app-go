package main

import (
	"context"
	"expedientes-backend/internal/config"
	"expedientes-backend/internal/database"
	"expedientes-backend/internal/handlers"
	"expedientes-backend/internal/middleware"
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

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.Connect(cfg.MongoDBURI, cfg.MongoDBDatabase)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Disconnect()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	profileRepo := repository.NewProfileRepository(db)
	expedienteRepo := repository.NewExpedienteRepository(db)
	movimientoRepo := repository.NewMovimientoRepository(db)
	juzgadoRepo := repository.NewJuzgadoRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg.JWTSecret, cfg.JWTExpiration)
	userService := services.NewUserService(userRepo)
	expedienteService := services.NewExpedienteService(expedienteRepo)
	movimientoService := services.NewMovimientoService(movimientoRepo)
	juzgadoService := services.NewJuzgadoService(juzgadoRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	userHandler := handlers.NewUserHandler(userService)
	profileHandler := handlers.NewProfileHandler(profileRepo)
	expedienteHandler := handlers.NewExpedienteHandler(expedienteService)
	movimientoHandler := handlers.NewMovimientoHandler(movimientoService)
	juzgadoHandler := handlers.NewJuzgadoHandler(juzgadoService)

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router
	router := gin.Default()

	// CORS middleware
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = cfg.CORSAllowedOrigins
	corsConfig.AllowCredentials = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Accept", "X-Requested-With", "Cache-Control"}
	corsConfig.ExposeHeaders = []string{"Content-Length", "Authorization"}
	corsConfig.MaxAge = 12 * 3600 // 12 hours
	router.Use(cors.New(corsConfig))

	// Global middleware
	router.Use(middleware.Logger())
	router.Use(middleware.Recovery())
	router.Use(middleware.RateLimit(cfg.RateLimitRequests, cfg.RateLimitWindow))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"timestamp": time.Now().UTC(),
			"service":   "expedientes-backend",
		})
	})

	// API routes
	v1 := router.Group("/api/v1")
	{
		// Auth routes (public)
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/logout", authHandler.Logout)
		}

		// Protected routes
		protected := v1.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// User routes
			users := protected.Group("/users")
			{
				users.GET("/", userHandler.GetUsers)
				users.GET("/:id", userHandler.GetUser)
				users.POST("/", userHandler.CreateUser)
				users.PUT("/:id", userHandler.UpdateUser)
				users.DELETE("/:id", userHandler.DeleteUser)
				users.GET("/profile", userHandler.GetProfile)
				users.PUT("/profile", userHandler.UpdateProfile)
				users.PUT("/password", userHandler.ChangePassword)
			}

			// Profile routes
			profiles := protected.Group("/profiles")
			{
				profiles.GET("/", profileHandler.GetProfiles)
				profiles.GET("/:id", profileHandler.GetProfile)
			}

			// Expediente routes
			expedientes := protected.Group("/expedientes")
			{
				expedientes.GET("/", expedienteHandler.GetExpedientes)
				expedientes.GET("/:id", expedienteHandler.GetExpediente)
				expedientes.POST("/", expedienteHandler.CreateExpediente)
				expedientes.PUT("/:id", expedienteHandler.UpdateExpediente)
				expedientes.DELETE("/:id", expedienteHandler.DeleteExpediente)
				expedientes.PUT("/:id/estado", expedienteHandler.UpdateEstado)
				expedientes.GET("/search", expedienteHandler.SearchExpedientes)
			}

			// Movimiento routes
			movimientos := protected.Group("/movimientos")
			{
				movimientos.GET("/expediente/:expedienteId", movimientoHandler.GetMovimientosByExpediente)
				movimientos.GET("/:id", movimientoHandler.GetMovimiento)
				movimientos.POST("/", movimientoHandler.CreateMovimiento)
				movimientos.PUT("/:id", movimientoHandler.UpdateMovimiento)
				movimientos.DELETE("/:id", movimientoHandler.DeleteMovimiento)
			}

			// Juzgado routes
			juzgados := protected.Group("/juzgados")
			{
				juzgados.GET("/", juzgadoHandler.GetJuzgados)
				juzgados.GET("/:id", juzgadoHandler.GetJuzgado)
				juzgados.POST("/", juzgadoHandler.CreateJuzgado)
				juzgados.PUT("/:id", juzgadoHandler.UpdateJuzgado)
				juzgados.DELETE("/:id", juzgadoHandler.DeleteJuzgado)
			}

			// Dashboard routes
			dashboard := protected.Group("/dashboard")
			{
				dashboard.GET("/stats", handlers.GetDashboardStats(expedienteService, movimientoService))
			}
		}
	}

	// Create HTTP server
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting server on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Create a deadline to wait for
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}
