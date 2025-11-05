package main

import (
	"context"
	"fmt"
	"log"

	"expedientes-backend/internal/config"
	"expedientes-backend/internal/database"
	"expedientes-backend/internal/models"
	"expedientes-backend/internal/repository"
	"expedientes-backend/internal/services"
	"expedientes-backend/internal/utils"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Create() {
	fmt.Println("============================================")
	fmt.Println("👑 SCRIPT DE CREACIÓN - USUARIO ADMINISTRADOR")
	fmt.Println("============================================")

	// Cargar configuración
	cfg := config.Load()

	// Conectar a la base de datos
	db, err := database.Connect(cfg.MongoDBURI, cfg.MongoDBDatabase)
	if err != nil {
		log.Fatal("❌ Error conectando a la base de datos:", err)
	}
	defer db.Disconnect()

	ctx := context.Background()

	// Inicializar repositorios
	profileRepo := repository.NewProfileRepository(db.GetMongoDB())
	userRepo := repository.NewUserRepository(db)

	// Inicializar servicios
	profileService := services.NewProfileService(profileRepo)
	userService := services.NewUserServiceWithServices(userRepo, profileService)

	// Crear usuario administrador
	createAdministratorUser(ctx, profileRepo, userService)
}

func createAdministratorUser(ctx context.Context, profileRepo *repository.ProfileRepository, userService *services.UserService) {
	fmt.Println("========================================")
	fmt.Println("\n👑 CREANDO USUARIO ADMINISTRADOR COMPLETO")
	fmt.Println("========================================")

	// 1. Crear perfil de administrador con TODOS los permisos
	fmt.Println("\n1️⃣ Creando perfil de Administrador con permisos completos...")
	adminProfile := createAdministratorProfile(ctx, profileRepo)
	if adminProfile == nil {
		log.Fatal("❌ No se pudo crear el perfil de administrador")
	}

	// 2. Crear usuario administrador
	fmt.Println("\n2️⃣ Creando usuario administrador...")
	adminUser := createAdminUser(userService, adminProfile.ID)
	if adminUser == nil {
		log.Fatal("❌ No se pudo crear el usuario administrador")
	}

	// 3. Verificar permisos del administrador
	fmt.Println("\n3️⃣ Verificando permisos del administrador...")
	verifyAdminPermissions(ctx, userService, adminUser)

	// 4. Mostrar resumen final
	showFinalSummary(adminProfile, adminUser)
}

func createAdministratorProfile(ctx context.Context, profileRepo *repository.ProfileRepository) *models.Profile {
	// Crear perfil con TODOS los permisos de administrador según recomendación
	adminProfile := &models.Profile{
		Name:        "Administrador Completo",
		Slug:        "administrador-completo",
		Description: "Perfil de administrador con todos los permisos del sistema judicial",
		Active:      true,
		IsSystem:    true, // Marcar como perfil del sistema

		// TODOS los permisos según la recomendación:
		Permissions: []models.Permission{
			// 👤 Gestión completa de usuarios
			models.PermissionUserCreate,
			models.PermissionUserRead,
			models.PermissionUserUpdate,
			models.PermissionUserDelete,
			models.PermissionUserManage, // Incluye todos los anteriores

			// 👥 Gestión completa de perfiles
			models.PermissionProfileRead,
			models.PermissionProfileWrite,

			// 📁 Gestión completa de expedientes
			models.PermissionExpedienteCreate,
			models.PermissionExpedienteRead,
			models.PermissionExpedienteUpdate,
			models.PermissionExpedienteDelete,
			models.PermissionExpedienteManage, // Incluye todos los anteriores

			// ⚙️ Administración del sistema
			models.PermissionSystemAdmin,
			models.PermissionSystemRead,
		},
	}

	createdProfile, err := profileRepo.CreateProfile(ctx, adminProfile)
	if err != nil {
		fmt.Printf("❌ Error creando perfil de administrador: %v\n", err)
		return nil
	}

	fmt.Printf("✅ Perfil de administrador creado exitosamente\n")
	fmt.Printf("   📝 Nombre: %s\n", createdProfile.Name)
	fmt.Printf("   🔑 Slug: %s\n", createdProfile.Slug)
	fmt.Printf("   📋 Descripción: %s\n", createdProfile.Description)
	fmt.Printf("   🔐 Permisos asignados: %d\n", len(createdProfile.Permissions))

	fmt.Println("\n   📊 Lista detallada de permisos:")
	for i, permission := range createdProfile.Permissions {
		fmt.Printf("   %2d. %s\n", i+1, string(permission))
	}

	return createdProfile
}

func createAdminUser(userService *services.UserService, profileID primitive.ObjectID) *models.User {
	// Crear usuario administrador
	adminUser := &models.User{
		Email:     "admin@tribunal.com",
		Password:  hashPassword("Admin123!@#"),
		Nombre:    "Administrador",
		Apellido:  "Sistema",
		Documento: "00000001",
		Telefono:  "555-0000",
		ProfileID: profileID,
		Activo:    true,
	}

	err := userService.Create(adminUser)
	if err != nil {
		fmt.Printf("❌ Error creando usuario administrador: %v\n", err)
		return nil
	}

	fmt.Printf("✅ Usuario administrador creado exitosamente\n")
	fmt.Printf("   📧 Email: %s\n", adminUser.Email)
	fmt.Printf("   👤 Nombre: %s %s\n", adminUser.Nombre, adminUser.Apellido)
	fmt.Printf("   📄 Documento: %s\n", adminUser.Documento)
	fmt.Printf("   📞 Teléfono: %s\n", adminUser.Telefono)
	fmt.Printf("   🔑 Contraseña: Admin123!@# (temporal)\n")
	fmt.Printf("   ✅ Estado: Activo\n")

	return adminUser
}

func verifyAdminPermissions(ctx context.Context, userService *services.UserService, adminUser *models.User) {
	fmt.Println("\n🔍 Verificando permisos del administrador...")

	// Lista de permisos críticos para verificar
	criticalPermissions := []struct {
		permission  models.Permission
		description string
	}{
		{models.PermissionUserManage, "Gestión completa de usuarios"},
		{models.PermissionProfileWrite, "Escritura de perfiles"},
		{models.PermissionExpedienteManage, "Gestión completa de expedientes"},
		{models.PermissionSystemAdmin, "Administración del sistema"},
		{models.PermissionUserCreate, "Crear usuarios"},
		{models.PermissionUserDelete, "Eliminar usuarios"},
		{models.PermissionExpedienteDelete, "Eliminar expedientes"},
	}

	permissionsVerified := 0
	for _, perm := range criticalPermissions {
		hasPermission, err := userService.ValidateUserPermission(ctx, adminUser, perm.permission)
		if err != nil {
			fmt.Printf("   ⚠️  Error verificando %s: %v\n", perm.description, err)
		} else if hasPermission {
			fmt.Printf("   ✅ %s: CONCEDIDO\n", perm.description)
			permissionsVerified++
		} else {
			fmt.Printf("   ❌ %s: DENEGADO\n", perm.description)
		}
	}

	fmt.Printf("\n   📊 Permisos verificados: %d/%d\n", permissionsVerified, len(criticalPermissions))

	if permissionsVerified == len(criticalPermissions) {
		fmt.Println("   🎉 ¡Todos los permisos críticos están funcionando correctamente!")
	} else {
		fmt.Println("   ⚠️  Algunos permisos no están funcionando como se esperaba")
	}
}

func showFinalSummary(adminProfile *models.Profile, adminUser *models.User) {
	fmt.Println("=====================")
	fmt.Println("\n📋 RESUMEN DE CREACIÓN")
	fmt.Println("=====================")
	fmt.Printf("✅ Perfil creado: %s (ID: %s)\n", adminProfile.Name, adminProfile.ID.Hex())
	fmt.Printf("✅ Usuario creado: %s\n", adminUser.Email)
	fmt.Printf("✅ Permisos asignados: %d\n", len(adminProfile.Permissions))
	fmt.Println("\n🎉 ¡Administrador creado exitosamente!")

	fmt.Println("==========================")
	fmt.Println("\n🔑 CREDENCIALES DE ACCESO:")
	fmt.Println("==========================")
	fmt.Printf("📧 Email: %s\n", adminUser.Email)
	fmt.Printf("🔐 Contraseña: Admin123!@#\n")
	fmt.Println("⚠️  Por favor, cambie la contraseña después del primer acceso")

	fmt.Println("=============================")
	fmt.Println("\n📌 PERMISOS DEL ADMINISTRADOR:")
	fmt.Println("=============================")
	fmt.Println("👤 USUARIOS: crear, leer, actualizar, eliminar, gestionar")
	fmt.Println("👥 PERFILES: leer, escribir")
	fmt.Println("📁 EXPEDIENTES: crear, leer, actualizar, eliminar, gestionar")
	fmt.Println("⚙️  SISTEMA: administración completa, lectura")
}

// hashPassword crea un hash seguro de la contraseña
func hashPassword(password string) string {
	hashed, err := utils.HashPassword(password)
	if err != nil {
		// Fallback para pruebas
		return "$2a$10$" + password
	}
	return hashed
}
