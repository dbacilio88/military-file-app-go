package services

import (
	"context"
	"errors"
	"expedientes-backend/internal/models"
	"expedientes-backend/internal/repository"
	"expedientes-backend/internal/utils"
	"fmt"
	"log"
	"mime/multipart"
	"strconv"
	"strings"
	"time"

	"github.com/xuri/excelize/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UserService handles user business logic
type UserService struct {
	userRepo       *repository.UserRepository
	profileService *ProfileService
}

// NewUserService creates a new user service
func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// NewUserServiceWithServices creates a new user service with profile service
func NewUserServiceWithServices(userRepo *repository.UserRepository, profileService *ProfileService) *UserService {
	return &UserService{
		userRepo:       userRepo,
		profileService: profileService,
	}
}

// GetAll returns all users with pagination
func (s *UserService) GetAll(page, limit int, sortBy, sortOrder string) ([]*models.User, int64, error) {
	return s.userRepo.GetAll(page, limit, sortBy, sortOrder)
}

// Create creates a new user (password should already be hashed by caller)
func (s *UserService) Create(user *models.User) error {
	// Validate email uniqueness
	exists, err := s.userRepo.ExistsByEmail(user.Email)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("ya existe un usuario con este email")
	}

	// Validate document uniqueness
	exists, err = s.userRepo.ExistsByDocument(user.Documento)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("ya existe un usuario con este documento")
	}

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
	// Validate email uniqueness if being updated
	if err := s.validateEmailUpdate(id, updates); err != nil {
		return err
	}

	// Validate document uniqueness if being updated
	if err := s.validateDocumentUpdate(id, updates); err != nil {
		return err
	}

	return s.userRepo.Update(id, updates)
}

// validateEmailUpdate validates email uniqueness when updating a user
func (s *UserService) validateEmailUpdate(id string, updates map[string]interface{}) error {
	email, ok := updates["email"].(string)
	if !ok {
		return nil // Email not being updated
	}

	exists, err := s.userRepo.ExistsByEmail(email)
	if err != nil {
		return err
	}

	if !exists {
		return nil // Email doesn't exist, safe to update
	}

	// Check if the email belongs to the same user being updated
	currentUser, err := s.userRepo.GetByID(id)
	if err != nil {
		return err
	}

	if currentUser.Email == email {
		return nil // Same email, no conflict
	}

	return errors.New("ya existe un usuario con este email")
}

// validateDocumentUpdate validates document uniqueness when updating a user
func (s *UserService) validateDocumentUpdate(id string, updates map[string]interface{}) error {
	documento, ok := updates["documento"].(string)
	if !ok {
		return nil // Document not being updated
	}

	exists, err := s.userRepo.ExistsByDocument(documento)
	if err != nil {
		return err
	}

	if !exists {
		return nil // Document doesn't exist, safe to update
	}

	// Check if the document belongs to the same user being updated
	currentUser, err := s.userRepo.GetByID(id)
	if err != nil {
		return err
	}

	if currentUser.Documento == documento {
		return nil // Same document, no conflict
	}

	return errors.New("ya existe un usuario con este documento")
}

// Delete soft-deletes a user
func (s *UserService) Delete(id string) error {
	return s.userRepo.Delete(id)
}

// GetUserWithProfile returns a user by ID with profile information
func (s *UserService) GetUserWithProfile(ctx context.Context, userID string) (*models.UserResponse, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	// Convert to response
	response := user.ToUserResponse()
	return &response, nil
}

// GetUserEffectivePermissions returns all effective permissions for a user
func (s *UserService) GetUserEffectivePermissions(ctx context.Context, user *models.User) ([]models.Permission, error) {
	if s.profileService == nil {
		// Legacy mode - return empty permissions
		return []models.Permission{}, nil
	}

	return s.profileService.GetUserEffectivePermissions(ctx, user)
}

// ValidateUserPermission checks if user has specific permission
func (s *UserService) ValidateUserPermission(ctx context.Context, user *models.User, permission models.Permission) (bool, error) {
	if s.profileService == nil {
		// No profile service - always allow for backward compatibility
		return true, nil
	}

	// Check permissions through profile
	if user.ProfileID.IsZero() {
		return false, nil
	}

	return s.profileService.HasPermission(ctx, user.ProfileID, permission)
}

// CreateUser creates a new user with validation
func (s *UserService) CreateUser(ctx context.Context, user *models.User) error {
	// Validate profile exists
	if !user.ProfileID.IsZero() && s.profileService != nil {
		_, err := s.profileService.GetProfileByID(ctx, user.ProfileID)
		if err != nil {
			return errors.New("invalid profile ID")
		}
	}

	return s.userRepo.Create(user)
}

// InitializeSystemUser creates the default system administrator if it doesn't exist
func (s *UserService) InitializeSystemUser(ctx context.Context) error {
	// Check if any user with administrador profile exists
	adminProfile, err := s.profileService.GetProfileBySlug(ctx, "administrador")
	if err != nil {
		return fmt.Errorf("failed to get administrator profile: %w", err)
	}

	// Check if admin user already exists
	exists, err := s.userRepo.ExistsByProfileID(ctx, adminProfile.ID)
	if err != nil {
		return fmt.Errorf("failed to check if admin user exists: %w", err)
	}

	if !exists {
		// Create default admin user
		hashedPassword, err := utils.HashPassword("admin123") // Default password
		if err != nil {
			return fmt.Errorf("failed to hash password: %w", err)
		}

		adminUser := &models.User{
			Email:     "admin@sistema.mil",
			Password:  hashedPassword,
			Nombre:    "Administrador",
			Apellido:  "Administrador",
			Documento: "00000000",
			Telefono:  "123456789",
			ProfileID: adminProfile.ID,
			Activo:    true,
		}

		if err := s.CreateUser(ctx, adminUser); err != nil {
			return fmt.Errorf("failed to create admin user: %w", err)
		}

		log.Printf("✅ Default admin user created: %s", adminUser.Email)
	}

	return nil
}

// ExpedienteService handles expediente business logic
type ExpedienteService struct {
	// Add repository when created
	expedienteRepo *repository.ExpedienteRepository
}

// NewExpedienteService creates a new expediente service
func NewExpedienteService(expedienteRepo *repository.ExpedienteRepository) *ExpedienteService {
	return &ExpedienteService{
		expedienteRepo: expedienteRepo,
	}
}

// Create creates a new expediente
func (s *ExpedienteService) Create(expediente *models.Expediente) error {
	// Check if CIP already exists
	existing, err := s.expedienteRepo.GetByCIP(expediente.CIP)
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New("expediente with this CIP already exists")
	}

	// Auto-calcular ubicación basada en el primer apellido
	expediente.Ubicacion = s.calculateUbicacion(expediente.ApellidosNombres)

	return s.expedienteRepo.Create(expediente)
}

// calculateUbicacion calcula la ubicación basada en las primeras dos letras del primer apellido
func (s *ExpedienteService) calculateUbicacion(apellidosNombres string) string {
	if apellidosNombres == "" {
		return "ZZ" // Default para casos sin apellido
	}

	// Extraer primer apellido
	parts := strings.Fields(strings.TrimSpace(apellidosNombres))
	if len(parts) == 0 {
		return "ZZ"
	}

	primerApellido := strings.ToUpper(parts[0])
	if len(primerApellido) < 2 {
		return primerApellido + "Z" // Completar con Z si es muy corto
	}

	return primerApellido[:2]
}

// calculateOrden calcula el orden según grado y situación militar
func (s *ExpedienteService) calculateOrden(grado models.Grado, situacion models.SituacionMilitar) int {
	gradoPriority := map[models.Grado]int{
		"GRAL":    1,
		"CRL":     2,
		"TTE CRL": 3,
		"MY":      4,
		"CAP":     5,
		"TTE":     6,
		"STTE":    7,
		"TCO":     8,
		"SSOO":    9,
		"EC":      10,
		"TROPA":   11,
	}

	situacionPriority := map[models.SituacionMilitar]int{
		"Actividad": 1,
		"Retiro":    2,
	}

	// Orden base: grado * 1000 + situación * 100
	return gradoPriority[grado]*1000 + situacionPriority[situacion]*100
}

// GetExpedientesByDivision obtiene expedientes por división específica
func (s *ExpedienteService) GetExpedientesByDivision(divisionRange string) ([]*models.Expediente, error) {
	// Definir grados de oficiales según especificación
	gradosOficiales := []models.Grado{"STTE", "TTE", "CAP", "MY", "TTE CRL", "CRL", "GRAL"}

	return s.expedienteRepo.GetByDivision(divisionRange, gradosOficiales, "Actividad")
}

// GetByID returns an expediente by ID
func (s *ExpedienteService) GetByID(id string) (*models.Expediente, error) {
	return s.expedienteRepo.GetByID(id)
}

// GetAll returns all expedientes with pagination
func (s *ExpedienteService) GetAll(page, limit int, sortBy, sortOrder string) ([]*models.Expediente, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100 // Max limit
	}

	return s.expedienteRepo.GetAll(page, limit, sortBy, sortOrder)
}

// Search searches expedientes with filters
func (s *ExpedienteService) Search(params models.ExpedienteSearchParams) ([]*models.Expediente, int64, error) {
	if params.Page < 1 {
		params.Page = 1
	}
	if params.Limit < 1 {
		params.Limit = 10
	}
	if params.Limit > 100 {
		params.Limit = 100
	}

	return s.expedienteRepo.Search(params)
}

// ExportAll returns minimal data for all expedientes to be exported
func (s *ExpedienteService) ExportAll() ([]models.ExpedienteExport, error) {
	return s.expedienteRepo.GetAllForExport()
}

// Update updates an expediente
func (s *ExpedienteService) Update(id string, updates map[string]interface{}) error {
	// If CIP is being updated, check if it already exists
	if cip, ok := updates["cip"].(string); ok {
		existing, err := s.expedienteRepo.GetByCIP(cip)
		if err != nil {
			return err
		}
		if existing != nil && existing.ID.Hex() != id {
			return errors.New("expediente with this CIP already exists")
		}
	}

	// Si se actualizan los apellidos, recalcular la ubicación automáticamente
	if apellidos, ok := updates["apellidos_nombres"].(string); ok {
		updates["ubicacion"] = s.calculateUbicacion(apellidos)
	}

	// Si se actualiza grado o situación militar, recalcular orden
	if grado, gradoOk := updates["grado"]; gradoOk {
		if situacion, situacionOk := updates["situacion_militar"]; situacionOk {
			if g, ok := grado.(models.Grado); ok {
				if sit, ok := situacion.(models.SituacionMilitar); ok {
					updates["orden"] = s.calculateOrden(g, sit)
				}
			}
		} else {
			// Si solo se actualiza grado, obtener la situación actual
			existing, err := s.expedienteRepo.GetByID(id)
			if err == nil && existing != nil {
				if g, ok := grado.(models.Grado); ok {
					updates["orden"] = s.calculateOrden(g, existing.SituacionMilitar)
				}
			}
		}
	} else if situacion, situacionOk := updates["situacion_militar"]; situacionOk {
		// Si solo se actualiza situación, obtener el grado actual
		existing, err := s.expedienteRepo.GetByID(id)
		if err == nil && existing != nil {
			if sit, ok := situacion.(models.SituacionMilitar); ok {
				updates["orden"] = s.calculateOrden(existing.Grado, sit)
			}
		}
	}

	return s.expedienteRepo.Update(id, updates)
}

// UpdateEstado updates the estado of an expediente
func (s *ExpedienteService) UpdateEstado(id string, estado models.EstadoExpediente, updatedBy string) error {
	objID, err := primitive.ObjectIDFromHex(updatedBy)
	if err != nil {
		return errors.New("invalid updatedBy ID")
	}

	return s.expedienteRepo.UpdateEstado(id, estado, objID)
}

// Delete soft-deletes an expediente
func (s *ExpedienteService) Delete(id string, deletedBy string) error {
	objID, err := primitive.ObjectIDFromHex(deletedBy)
	if err != nil {
		return errors.New("invalid deletedBy ID")
	}

	return s.expedienteRepo.Delete(id, objID)
}

// BulkImportFromExcel imports expedientes from an Excel file
func (s *ExpedienteService) BulkImportFromExcel(file *multipart.FileHeader, createdBy primitive.ObjectID) (*models.BulkImportResult, error) {
	// Open the Excel file
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("error opening file: %w", err)
	}
	defer src.Close()

	// Read Excel file
	excelFile, err := excelize.OpenReader(src)
	if err != nil {
		return nil, fmt.Errorf("error reading Excel file: %w", err)
	}
	defer excelFile.Close()

	// Get the first sheet
	sheetName := excelFile.GetSheetName(0)
	if sheetName == "" {
		return nil, errors.New("no sheets found in Excel file")
	}

	// Read all rows
	rows, err := excelFile.GetRows(sheetName)
	if err != nil {
		return nil, fmt.Errorf("error reading rows: %w", err)
	}

	if len(rows) < 2 {
		return nil, errors.New("excel file must contain at least a header row and one data row")
	}

	// Validate headers
	expectedHeaders := []string{"Grado", "CIP", "ApellidosNombres", "NumeroPaginas", "Ano"}
	if err := s.validateHeaders(rows[0], expectedHeaders); err != nil {
		return nil, err
	}

	// Process data rows
	var bulkData []models.BulkImportExpediente
	for i, row := range rows[1:] {
		if len(row) < 5 {
			continue // Skip incomplete rows
		}

		ano := ""
		if len(row) > 4 {
			ano = strings.TrimSpace(row[4])
		}

		bulkData = append(bulkData, models.BulkImportExpediente{
			Grado:            strings.TrimSpace(row[0]),
			CIP:              strings.TrimSpace(row[1]),
			ApellidosNombres: strings.TrimSpace(row[2]),
			NumeroPaginas:    strings.TrimSpace(row[3]),
			Ano:              ano,
			Fila:             i + 2, // +2 because index starts at 0 and we skip header
		})
	}

	// Process the bulk import
	return s.processBulkImport(bulkData, createdBy)
}

// validateHeaders validates that Excel headers match expected format
func (s *ExpedienteService) validateHeaders(headers []string, expected []string) error {
	if len(headers) < len(expected) {
		return fmt.Errorf("excel file must contain at least %d columns: %s", len(expected), strings.Join(expected, ", "))
	}

	for i, expectedHeader := range expected {
		if i >= len(headers) || strings.TrimSpace(headers[i]) != expectedHeader {
			return fmt.Errorf("column %d should be '%s', found '%s'", i+1, expectedHeader, strings.TrimSpace(headers[i]))
		}
	}

	return nil
}

// processBulkImport processes the bulk import data
func (s *ExpedienteService) processBulkImport(bulkData []models.BulkImportExpediente, createdBy primitive.ObjectID) (*models.BulkImportResult, error) {
	result := &models.BulkImportResult{
		TotalProcesados: len(bulkData),
		Exitosos:        0,
		Fallidos:        0,
		Errores:         []models.BulkImportError{},
		Expedientes:     []primitive.ObjectID{},
	}

	// Validate and convert data
	var validExpedientes []models.Expediente
	var allCIPs []string
	cipMap := make(map[string]int) // Track CIP occurrences in current batch

	now := time.Now().UTC()

	// First pass: collect all CIPs and check for internal duplicates
	for i, data := range bulkData {
		if data.CIP != "" {
			allCIPs = append(allCIPs, data.CIP)
			if existingRow, exists := cipMap[data.CIP]; exists {
				// Internal duplicate found
				result.Errores = append(result.Errores, models.BulkImportError{
					Fila:  i + 2, // +2 because Excel is 1-indexed and has header
					Campo: "CIP",
					Valor: data.CIP,
					Error: fmt.Sprintf("CIP duplicado en el archivo. Primera aparición en fila %d", existingRow+2),
				})
				result.Fallidos++
				continue
			}
			cipMap[data.CIP] = i
		}

		// Validate individual record
		expediente, errs := s.validateAndConvertBulkRecord(data, createdBy, now)
		if len(errs) > 0 {
			result.Errores = append(result.Errores, errs...)
			result.Fallidos++
			continue
		}

		validExpedientes = append(validExpedientes, *expediente)
	}

	// Check for duplicate CIPs in database
	if len(allCIPs) > 0 {
		existingCIPs, err := s.expedienteRepo.CheckDuplicateCIPs(allCIPs)
		if err != nil {
			return nil, fmt.Errorf("error checking duplicate CIPs: %w", err)
		}

		// Remove expedientes with duplicate CIPs
		if len(existingCIPs) > 0 {
			validExpedientes, result.Errores = s.filterDuplicateCIPs(validExpedientes, existingCIPs, bulkData, result.Errores)
			result.Fallidos += len(existingCIPs)
		}
	}

	// Bulk insert valid expedientes
	if len(validExpedientes) > 0 {
		insertedIDs, err := s.expedienteRepo.BulkCreate(validExpedientes)
		if err != nil {
			return nil, fmt.Errorf("error during bulk insert: %w", err)
		}

		result.Expedientes = insertedIDs
		result.Exitosos = len(insertedIDs)
	}

	// Recalculate totals
	result.Fallidos = result.TotalProcesados - result.Exitosos

	return result, nil
}

// validateAndConvertBulkRecord validates and converts a single bulk import record
func (s *ExpedienteService) validateAndConvertBulkRecord(data models.BulkImportExpediente, createdBy primitive.ObjectID, now time.Time) (*models.Expediente, []models.BulkImportError) {
	var errors []models.BulkImportError

	// Validate Grado
	var grado models.Grado
	switch strings.ToUpper(strings.TrimSpace(data.Grado)) {
	case "GRAL":
		grado = models.GradoGRAL
	case "CRL":
		grado = models.GradoCRL
	case "TTE CRL":
		grado = models.GradoTTECRL
	case "MY":
		grado = models.GradoMY
	case "CAP":
		grado = models.GradoCAP
	case "TTE":
		grado = models.GradoTTE
	case "STTE":
		grado = models.GradoSTTE
	case "TCO":
		grado = models.GradoTCO
	case "SSOO":
		grado = models.GradoSSOO
	case "EC":
		grado = models.GradoEC
	case "TROPA":
		grado = models.GradoTropa
	default:
		errors = append(errors, models.BulkImportError{
			Fila:     data.Fila,
			Campo:    "Grado",
			Valor:    data.Grado,
			Error:    "Grado debe ser uno de: GRAL, CRL, TTE CRL, MY, CAP, TTE, STTE, TCO, SSOO, EC, TROPA",
			Registro: data,
		})
	}

	// Validate CIP
	if strings.TrimSpace(data.CIP) == "" {
		errors = append(errors, models.BulkImportError{
			Fila:     data.Fila,
			Campo:    "CIP",
			Valor:    data.CIP,
			Error:    "CIP es requerido",
			Registro: data,
		})
	}

	// Validate ApellidosNombres
	apellidosNombres := strings.TrimSpace(data.ApellidosNombres)
	if apellidosNombres == "" {
		errors = append(errors, models.BulkImportError{
			Fila:     data.Fila,
			Campo:    "ApellidosNombres",
			Valor:    data.ApellidosNombres,
			Error:    "ApellidosNombres es requerido",
			Registro: data,
		})
	} else if len(apellidosNombres) < 3 {
		errors = append(errors, models.BulkImportError{
			Fila:     data.Fila,
			Campo:    "ApellidosNombres",
			Valor:    data.ApellidosNombres,
			Error:    "ApellidosNombres debe tener al menos 3 caracteres",
			Registro: data,
		})
	}

	// Validate NumeroPaginas
	var numeroPaginas int
	if numPagStr := strings.TrimSpace(data.NumeroPaginas); numPagStr == "" {
		errors = append(errors, models.BulkImportError{
			Fila:     data.Fila,
			Campo:    "NumeroPaginas",
			Valor:    data.NumeroPaginas,
			Error:    "NumeroPaginas es requerido",
			Registro: data,
		})
	} else {
		var err error
		numeroPaginas, err = strconv.Atoi(numPagStr)
		if err != nil || numeroPaginas < 1 {
			errors = append(errors, models.BulkImportError{
				Fila:     data.Fila,
				Campo:    "NumeroPaginas",
				Valor:    data.NumeroPaginas,
				Error:    "NumeroPaginas debe ser un número entero mayor a 0",
				Registro: data,
			})
		}
	}

	// Validate Ano (Year)
	var ano int
	if anoStr := strings.TrimSpace(data.Ano); anoStr == "" {
		// If not provided, use current year as default
		ano = time.Now().Year()
	} else {
		var err error
		ano, err = strconv.Atoi(anoStr)
		if err != nil || ano < 1900 || ano > 2100 {
			errors = append(errors, models.BulkImportError{
				Fila:     data.Fila,
				Campo:    "Ano",
				Valor:    data.Ano,
				Error:    "Ano debe ser un número entero válido entre 1900 y 2100",
				Registro: data,
			})
		}
	}

	// Return errors if any
	if len(errors) > 0 {
		return nil, errors
	}

	// Create expediente
	expediente := &models.Expediente{
		ID:                 primitive.NewObjectID(),
		Grado:              grado,
		ApellidosNombres:   apellidosNombres,
		NumeroPaginas:      numeroPaginas,
		SituacionMilitar:   models.SituacionActividad, // Default value
		CIP:                strings.TrimSpace(data.CIP),
		Estado:             models.EstadoDentro, // Default value
		Ubicacion:          "Archivo Central",   // Default value
		Ano:                ano,
		FechaRegistro:      now,
		FechaActualizacion: now,
		Orden:              1, // Temporary value, will be updated by repository
		CreatedAt:          now,
		UpdatedAt:          now,
		CreatedBy:          createdBy,
		UpdatedBy:          createdBy,
	}

	return expediente, nil
}

// filterDuplicateCIPs removes expedientes with CIPs that already exist in database
func (s *ExpedienteService) filterDuplicateCIPs(expedientes []models.Expediente, existingCIPs []string, bulkData []models.BulkImportExpediente, existingErrors []models.BulkImportError) ([]models.Expediente, []models.BulkImportError) {
	// Create map of existing CIPs for faster lookup
	existingMap := make(map[string]bool)
	for _, cip := range existingCIPs {
		existingMap[cip] = true
	}

	// Create map of bulk data by CIP for error reporting
	bulkMap := make(map[string]models.BulkImportExpediente)
	for _, data := range bulkData {
		bulkMap[data.CIP] = data
	}

	var filteredExpedientes []models.Expediente
	var updatedErrors []models.BulkImportError = existingErrors

	for _, exp := range expedientes {
		if existingMap[exp.CIP] {
			// Add error for duplicate CIP
			if bulkRecord, exists := bulkMap[exp.CIP]; exists {
				updatedErrors = append(updatedErrors, models.BulkImportError{
					Fila:     bulkRecord.Fila,
					Campo:    "CIP",
					Valor:    exp.CIP,
					Error:    "CIP ya existe en la base de datos",
					Registro: bulkRecord,
				})
			}
		} else {
			filteredExpedientes = append(filteredExpedientes, exp)
		}
	}

	return filteredExpedientes, updatedErrors
}

// GetDashboardStats retrieves comprehensive dashboard statistics
func (s *ExpedienteService) GetDashboardStats() (*models.DashboardStats, error) {
	return s.expedienteRepo.GetDashboardStats()
}
