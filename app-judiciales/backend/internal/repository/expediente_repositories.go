package repository

import (
	"context"
	"errors"
	"expedientes-backend/internal/database"
	"expedientes-backend/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ExpedienteRepository handles expediente data operations
type ExpedienteRepository struct {
	db         *database.Database
	collection *mongo.Collection
}

// NewExpedienteRepository creates a new expediente repository
func NewExpedienteRepository(db *database.Database) *ExpedienteRepository {
	return &ExpedienteRepository{
		db:         db,
		collection: db.Collection("expedientes"),
	}
}

// Create creates a new expediente
func (r *ExpedienteRepository) Create(expediente *models.Expediente) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	expediente.CreatedAt = time.Now()
	expediente.UpdatedAt = time.Now()
	expediente.FechaRegistro = time.Now()
	expediente.FechaActualizacion = time.Now()
	expediente.Estado = models.EstadoDentro // Default state

	result, err := r.collection.InsertOne(ctx, expediente)
	if err != nil {
		return err
	}

	expediente.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

// GetByID retrieves an expediente by ID
func (r *ExpedienteRepository) GetByID(id string) (*models.Expediente, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid ID format")
	}

	var expediente models.Expediente
	filter := bson.M{"_id": objID, "deletedAt": bson.M{"$exists": false}}
	err = r.collection.FindOne(ctx, filter).Decode(&expediente)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("expediente not found")
		}
		return nil, err
	}

	return &expediente, nil
}

// GetAll retrieves all expedientes with pagination
func (r *ExpedienteRepository) GetAll(page, limit int, sortBy, sortOrder string) ([]*models.Expediente, int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	filter := bson.M{"deletedAt": bson.M{"$exists": false}}

	// Count total documents
	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	// Pagination
	skip := (page - 1) * limit
	findOptions := options.Find()
	findOptions.SetSkip(int64(skip))
	findOptions.SetLimit(int64(limit))

	// Sorting
	if sortBy != "" {
		order := 1
		if sortOrder == "desc" {
			order = -1
		}
		findOptions.SetSort(bson.D{{Key: sortBy, Value: order}})
	} else {
		findOptions.SetSort(bson.D{{Key: "orden", Value: 1}}) // Default sort by orden
	}

	cursor, err := r.collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var expedientes []*models.Expediente
	if err = cursor.All(ctx, &expedientes); err != nil {
		return nil, 0, err
	}

	return expedientes, total, nil
}

// Search searches expedientes with filters
func (r *ExpedienteRepository) Search(params models.ExpedienteSearchParams) ([]*models.Expediente, int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	filter := bson.M{"deletedAt": bson.M{"$exists": false}}

	// Apply search filters
	if params.Grado != "" {
		filter["grado"] = params.Grado
	}
	if params.ApellidosNombres != "" {
		filter["apellidos_nombres"] = bson.M{"$regex": params.ApellidosNombres, "$options": "i"}
	}
	if params.SituacionMilitar != "" {
		filter["situacion_militar"] = params.SituacionMilitar
	}
	if params.CIP != "" {
		filter["cip"] = bson.M{"$regex": params.CIP, "$options": "i"}
	}
	if params.Estado != "" {
		filter["estado"] = params.Estado
	}
	if params.Ubicacion != "" {
		filter["ubicacion"] = bson.M{"$regex": params.Ubicacion, "$options": "i"}
	}
	if params.Orden > 0 {
		filter["orden"] = params.Orden
	}
	if !params.FechaInicio.IsZero() || !params.FechaFin.IsZero() {
		dateFilter := bson.M{}
		if !params.FechaInicio.IsZero() {
			dateFilter["$gte"] = params.FechaInicio
		}
		if !params.FechaFin.IsZero() {
			dateFilter["$lte"] = params.FechaFin
		}
		filter["fecha_registro"] = dateFilter
	}

	// Count total documents
	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	// Pagination
	page := params.Page
	if page < 1 {
		page = 1
	}
	limit := params.Limit
	if limit < 1 {
		limit = 10
	}

	skip := (page - 1) * limit
	findOptions := options.Find()
	findOptions.SetSkip(int64(skip))
	findOptions.SetLimit(int64(limit))

	// Sorting
	sortBy := params.SortBy
	if sortBy == "" {
		sortBy = "orden"
	}
	order := 1
	if params.SortOrder == "desc" {
		order = -1
	}
	findOptions.SetSort(bson.D{{Key: sortBy, Value: order}})

	cursor, err := r.collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var expedientes []*models.Expediente
	if err = cursor.All(ctx, &expedientes); err != nil {
		return nil, 0, err
	}

	return expedientes, total, nil
}

// Update updates an expediente
func (r *ExpedienteRepository) Update(id string, updates map[string]interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid ID format")
	}

	updates["updatedAt"] = time.Now()
	updates["fecha_actualizacion"] = time.Now()

	filter := bson.M{"_id": objID, "deletedAt": bson.M{"$exists": false}}
	update := bson.M{"$set": updates}

	result, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("expediente not found")
	}

	return nil
}

// UpdateEstado updates the estado of an expediente
func (r *ExpedienteRepository) UpdateEstado(id string, estado models.EstadoExpediente, updatedBy primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid ID format")
	}

	update := bson.M{
		"$set": bson.M{
			"estado":              estado,
			"updatedAt":           time.Now(),
			"fecha_actualizacion": time.Now(),
			"updatedBy":           updatedBy,
		},
	}

	filter := bson.M{"_id": objID, "deletedAt": bson.M{"$exists": false}}
	result, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("expediente not found")
	}

	return nil
}

// Delete soft-deletes an expediente
func (r *ExpedienteRepository) Delete(id string, deletedBy primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid ID format")
	}

	now := time.Now()
	update := bson.M{
		"$set": bson.M{
			"deletedAt": &now,
			"deletedBy": &deletedBy,
			"updatedAt": now,
		},
	}

	filter := bson.M{"_id": objID, "deletedAt": bson.M{"$exists": false}}
	result, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("expediente not found or already deleted")
	}

	return nil
}

// GetByCIP retrieves an expediente by CIP
func (r *ExpedienteRepository) GetByCIP(cip string) (*models.Expediente, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var expediente models.Expediente
	filter := bson.M{"cip": cip, "deletedAt": bson.M{"$exists": false}}
	err := r.collection.FindOne(ctx, filter).Decode(&expediente)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // Not found is not an error in this case
		}
		return nil, err
	}

	return &expediente, nil
}

// BulkCreate creates multiple expedientes in a single operation
func (r *ExpedienteRepository) BulkCreate(expedientes []models.Expediente) ([]primitive.ObjectID, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get the next available orden number
	nextOrden, err := r.getNextOrdenNumber(ctx)
	if err != nil {
		return nil, err
	}

	// Assign orden numbers to all expedientes
	for i := range expedientes {
		expedientes[i].Orden = nextOrden + i
	}

	// Convert to interface slice for bulk insert
	documents := make([]interface{}, len(expedientes))
	for i, exp := range expedientes {
		documents[i] = exp
	}

	result, err := r.collection.InsertMany(ctx, documents)
	if err != nil {
		return nil, err
	}

	// Convert inserted IDs to ObjectID slice
	insertedIDs := make([]primitive.ObjectID, len(result.InsertedIDs))
	for i, id := range result.InsertedIDs {
		insertedIDs[i] = id.(primitive.ObjectID)
	}

	return insertedIDs, nil
}

// getNextOrdenNumber gets the next available orden number
func (r *ExpedienteRepository) getNextOrdenNumber(ctx context.Context) (int, error) {
	// Find the highest orden number
	opts := options.FindOne().SetSort(bson.M{"orden": -1})
	filter := bson.M{"deletedAt": bson.M{"$exists": false}}

	var lastExpediente models.Expediente
	err := r.collection.FindOne(ctx, filter, opts).Decode(&lastExpediente)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return 1, nil // First expediente
		}
		return 0, err
	}

	return lastExpediente.Orden + 1, nil
}

// CheckDuplicateCIPs checks if any CIPs already exist in the database
func (r *ExpedienteRepository) CheckDuplicateCIPs(cips []string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"cip":       bson.M{"$in": cips},
		"deletedAt": bson.M{"$exists": false},
	}

	cursor, err := r.collection.Find(ctx, filter, options.Find().SetProjection(bson.M{"cip": 1}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var existingCIPs []string
	for cursor.Next(ctx) {
		var result struct {
			CIP string `bson:"cip"`
		}
		if err := cursor.Decode(&result); err != nil {
			continue
		}
		existingCIPs = append(existingCIPs, result.CIP)
	}

	return existingCIPs, nil
}

// Dashboard Statistics Methods

// GetDashboardStats retrieves comprehensive dashboard statistics
func (r *ExpedienteRepository) GetDashboardStats() (*models.DashboardStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	stats := &models.DashboardStats{
		GeneradoEn: time.Now().UTC(),
	}

	// Get general summary
	resumen, err := r.getResumenGeneral(ctx)
	if err != nil {
		return nil, err
	}
	stats.ResumenGeneral = *resumen

	// Get statistics by grade
	gradoStats, err := r.getEstadisticasPorGrado(ctx, resumen.TotalExpedientes)
	if err != nil {
		return nil, err
	}
	stats.EstadisticasPorGrado = gradoStats

	// Get statistics by state
	estadoStats, err := r.getEstadisticasPorEstado(ctx, resumen.TotalExpedientes)
	if err != nil {
		return nil, err
	}
	stats.EstadisticasPorEstado = estadoStats

	// Get statistics by military situation
	situacionStats, err := r.getEstadisticasPorSituacion(ctx, resumen.TotalExpedientes)
	if err != nil {
		return nil, err
	}
	stats.EstadisticasPorSituacion = situacionStats

	// Get statistics by location
	ubicacionStats, err := r.getEstadisticasPorUbicacion(ctx, resumen.TotalExpedientes)
	if err != nil {
		return nil, err
	}
	stats.EstadisticasPorUbicacion = ubicacionStats

	// Get temporal statistics
	temporalStats, err := r.getEstadisticasTemporales(ctx)
	if err != nil {
		return nil, err
	}
	stats.EstadisticasTemporales = *temporalStats

	return stats, nil
}

// getResumenGeneral calculates general summary statistics
func (r *ExpedienteRepository) getResumenGeneral(ctx context.Context) (*models.ResumenGeneral, error) {
	pipeline := []bson.M{
		{"$match": bson.M{"deletedAt": bson.M{"$exists": false}}},
		{"$group": bson.M{
			"_id":                nil,
			"total_expedientes":  bson.M{"$sum": 1},
			"expedientes_dentro": bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []interface{}{"$estado", "dentro"}}, 1, 0}}},
			"expedientes_fuera":  bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []interface{}{"$estado", "fuera"}}, 1, 0}}},
			"personal_actividad": bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []interface{}{"$situacion_militar", "Actividad"}}, 1, 0}}},
			"personal_retiro":    bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []interface{}{"$situacion_militar", "Retiro"}}, 1, 0}}},
			"total_paginas":      bson.M{"$sum": "$numero_paginas"},
			"ubicaciones_unicas": bson.M{"$addToSet": "$ubicacion"},
		}},
		{"$project": bson.M{
			"total_expedientes":               1,
			"expedientes_dentro":              1,
			"expedientes_fuera":               1,
			"personal_actividad":              1,
			"personal_retiro":                 1,
			"total_paginas":                   1,
			"ubicaciones_unicas":              bson.M{"$size": "$ubicaciones_unicas"},
			"porcentaje_dentro":               bson.M{"$multiply": []interface{}{bson.M{"$divide": []interface{}{"$expedientes_dentro", "$total_expedientes"}}, 100}},
			"porcentaje_fuera":                bson.M{"$multiply": []interface{}{bson.M{"$divide": []interface{}{"$expedientes_fuera", "$total_expedientes"}}, 100}},
			"porcentaje_actividad":            bson.M{"$multiply": []interface{}{bson.M{"$divide": []interface{}{"$personal_actividad", "$total_expedientes"}}, 100}},
			"porcentaje_retiro":               bson.M{"$multiply": []interface{}{bson.M{"$divide": []interface{}{"$personal_retiro", "$total_expedientes"}}, 100}},
			"promedio_paginas_por_expediente": bson.M{"$divide": []interface{}{"$total_paginas", "$total_expedientes"}},
		}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var result struct {
		TotalExpedientes             int     `bson:"total_expedientes"`
		ExpedientesDentro            int     `bson:"expedientes_dentro"`
		ExpedientesFuera             int     `bson:"expedientes_fuera"`
		PersonalActividad            int     `bson:"personal_actividad"`
		PersonalRetiro               int     `bson:"personal_retiro"`
		TotalPaginas                 int     `bson:"total_paginas"`
		UbicacionesUnicas            int     `bson:"ubicaciones_unicas"`
		PorcentajeDentro             float64 `bson:"porcentaje_dentro"`
		PorcentajeFuera              float64 `bson:"porcentaje_fuera"`
		PorcentajeActividad          float64 `bson:"porcentaje_actividad"`
		PorcentajeRetiro             float64 `bson:"porcentaje_retiro"`
		PromedioPaginasPorExpediente float64 `bson:"promedio_paginas_por_expediente"`
	}

	if cursor.Next(ctx) {
		if err := cursor.Decode(&result); err != nil {
			return nil, err
		}
	}

	return &models.ResumenGeneral{
		TotalExpedientes:             result.TotalExpedientes,
		ExpedientesDentro:            result.ExpedientesDentro,
		ExpedientesFuera:             result.ExpedientesFuera,
		PorcentajeDentro:             result.PorcentajeDentro,
		PorcentajeFuera:              result.PorcentajeFuera,
		PersonalActividad:            result.PersonalActividad,
		PersonalRetiro:               result.PersonalRetiro,
		PorcentajeActividad:          result.PorcentajeActividad,
		PorcentajeRetiro:             result.PorcentajeRetiro,
		PromedioPaginasPorExpediente: result.PromedioPaginasPorExpediente,
		TotalPaginas:                 result.TotalPaginas,
		UbicacionesUnicas:            result.UbicacionesUnicas,
	}, nil
}

// getEstadisticasPorGrado calculates statistics by military grade
func (r *ExpedienteRepository) getEstadisticasPorGrado(ctx context.Context, totalExpedientes int) ([]models.GradoStats, error) {
	pipeline := []bson.M{
		{"$match": bson.M{"deletedAt": bson.M{"$exists": false}}},
		{"$group": bson.M{
			"_id":           "$grado",
			"total":         bson.M{"$sum": 1},
			"dentro":        bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []interface{}{"$estado", "dentro"}}, 1, 0}}},
			"fuera":         bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []interface{}{"$estado", "fuera"}}, 1, 0}}},
			"actividad":     bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []interface{}{"$situacion_militar", "Actividad"}}, 1, 0}}},
			"retiro":        bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []interface{}{"$situacion_militar", "Retiro"}}, 1, 0}}},
			"total_paginas": bson.M{"$sum": "$numero_paginas"},
		}},
		{"$sort": bson.M{"total": -1}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var gradoStats []models.GradoStats
	for cursor.Next(ctx) {
		var result struct {
			Grado        models.Grado `bson:"_id"`
			Total        int          `bson:"total"`
			Dentro       int          `bson:"dentro"`
			Fuera        int          `bson:"fuera"`
			Actividad    int          `bson:"actividad"`
			Retiro       int          `bson:"retiro"`
			TotalPaginas int          `bson:"total_paginas"`
		}
		if err := cursor.Decode(&result); err != nil {
			continue
		}

		porcentaje := float64(0)
		if totalExpedientes > 0 {
			porcentaje = (float64(result.Total) / float64(totalExpedientes)) * 100
		}

		gradoStats = append(gradoStats, models.GradoStats{
			Grado:        result.Grado,
			Total:        result.Total,
			Dentro:       result.Dentro,
			Fuera:        result.Fuera,
			Actividad:    result.Actividad,
			Retiro:       result.Retiro,
			Porcentaje:   porcentaje,
			TotalPaginas: result.TotalPaginas,
		})
	}

	return gradoStats, nil
}

// getEstadisticasPorEstado calculates statistics by state
func (r *ExpedienteRepository) getEstadisticasPorEstado(ctx context.Context, totalExpedientes int) ([]models.EstadoStats, error) {
	pipeline := []bson.M{
		{"$match": bson.M{"deletedAt": bson.M{"$exists": false}}},
		{"$group": bson.M{
			"_id":           "$estado",
			"total":         bson.M{"$sum": 1},
			"total_paginas": bson.M{"$sum": "$numero_paginas"},
		}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var estadoStats []models.EstadoStats
	for cursor.Next(ctx) {
		var result struct {
			Estado       models.EstadoExpediente `bson:"_id"`
			Total        int                     `bson:"total"`
			TotalPaginas int                     `bson:"total_paginas"`
		}
		if err := cursor.Decode(&result); err != nil {
			continue
		}

		porcentaje := float64(0)
		if totalExpedientes > 0 {
			porcentaje = (float64(result.Total) / float64(totalExpedientes)) * 100
		}

		estadoStats = append(estadoStats, models.EstadoStats{
			Estado:       result.Estado,
			Total:        result.Total,
			Porcentaje:   porcentaje,
			TotalPaginas: result.TotalPaginas,
		})
	}

	return estadoStats, nil
}

// getEstadisticasPorSituacion calculates statistics by military situation
func (r *ExpedienteRepository) getEstadisticasPorSituacion(ctx context.Context, totalExpedientes int) ([]models.SituacionStats, error) {
	pipeline := []bson.M{
		{"$match": bson.M{"deletedAt": bson.M{"$exists": false}}},
		{"$group": bson.M{
			"_id":           "$situacion_militar",
			"total":         bson.M{"$sum": 1},
			"total_paginas": bson.M{"$sum": "$numero_paginas"},
		}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var situacionStats []models.SituacionStats
	for cursor.Next(ctx) {
		var result struct {
			Situacion    models.SituacionMilitar `bson:"_id"`
			Total        int                     `bson:"total"`
			TotalPaginas int                     `bson:"total_paginas"`
		}
		if err := cursor.Decode(&result); err != nil {
			continue
		}

		porcentaje := float64(0)
		if totalExpedientes > 0 {
			porcentaje = (float64(result.Total) / float64(totalExpedientes)) * 100
		}

		situacionStats = append(situacionStats, models.SituacionStats{
			Situacion:    result.Situacion,
			Total:        result.Total,
			Porcentaje:   porcentaje,
			TotalPaginas: result.TotalPaginas,
		})
	}

	return situacionStats, nil
}

// getEstadisticasPorUbicacion calculates statistics by location (top 10)
func (r *ExpedienteRepository) getEstadisticasPorUbicacion(ctx context.Context, totalExpedientes int) ([]models.UbicacionStats, error) {
	pipeline := []bson.M{
		{"$match": bson.M{"deletedAt": bson.M{"$exists": false}}},
		{"$group": bson.M{
			"_id":           "$ubicacion",
			"total":         bson.M{"$sum": 1},
			"total_paginas": bson.M{"$sum": "$numero_paginas"},
		}},
		{"$sort": bson.M{"total": -1}},
		{"$limit": 10}, // Top 10 locations
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var ubicacionStats []models.UbicacionStats
	for cursor.Next(ctx) {
		var result struct {
			Ubicacion    string `bson:"_id"`
			Total        int    `bson:"total"`
			TotalPaginas int    `bson:"total_paginas"`
		}
		if err := cursor.Decode(&result); err != nil {
			continue
		}

		porcentaje := float64(0)
		if totalExpedientes > 0 {
			porcentaje = (float64(result.Total) / float64(totalExpedientes)) * 100
		}

		ubicacionStats = append(ubicacionStats, models.UbicacionStats{
			Ubicacion:    result.Ubicacion,
			Total:        result.Total,
			Porcentaje:   porcentaje,
			TotalPaginas: result.TotalPaginas,
		})
	}

	return ubicacionStats, nil
}

// getEstadisticasTemporales calculates temporal statistics
func (r *ExpedienteRepository) getEstadisticasTemporales(ctx context.Context) (*models.EstadisticasTemporales, error) {
	// Get records from last 30 days
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	// Count records from last 30 days
	countLast30, err := r.collection.CountDocuments(ctx, bson.M{
		"createdAt": bson.M{"$gte": thirtyDaysAgo},
		"deletedAt": bson.M{"$exists": false},
	})
	if err != nil {
		return nil, err
	}

	// Get monthly statistics
	monthlyPipeline := []bson.M{
		{"$match": bson.M{"deletedAt": bson.M{"$exists": false}}},
		{"$group": bson.M{
			"_id": bson.M{
				"year":  bson.M{"$year": "$createdAt"},
				"month": bson.M{"$month": "$createdAt"},
			},
			"total": bson.M{"$sum": 1},
		}},
		{"$sort": bson.M{"_id.year": -1, "_id.month": -1}},
		{"$limit": 12}, // Last 12 months
	}

	monthCursor, err := r.collection.Aggregate(ctx, monthlyPipeline)
	if err != nil {
		return nil, err
	}
	defer monthCursor.Close(ctx)

	var registrosMensuales []models.RegistroMensual
	totalMensual := 0
	for monthCursor.Next(ctx) {
		var result struct {
			ID struct {
				Year  int `bson:"year"`
				Month int `bson:"month"`
			} `bson:"_id"`
			Total int `bson:"total"`
		}
		if err := monthCursor.Decode(&result); err != nil {
			continue
		}

		monthNames := []string{"", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
			"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"}

		totalMensual += result.Total
		registrosMensuales = append(registrosMensuales, models.RegistroMensual{
			Ano:       result.ID.Year,
			Mes:       result.ID.Month,
			MesNombre: monthNames[result.ID.Month],
			Total:     result.Total,
		})
	}

	// Calculate percentages for monthly data
	for i := range registrosMensuales {
		if totalMensual > 0 {
			registrosMensuales[i].Porcentaje = (float64(registrosMensuales[i].Total) / float64(totalMensual)) * 100
		}
	}

	// Get yearly statistics
	yearlyPipeline := []bson.M{
		{"$match": bson.M{"deletedAt": bson.M{"$exists": false}}},
		{"$group": bson.M{
			"_id":   bson.M{"$year": "$createdAt"},
			"total": bson.M{"$sum": 1},
		}},
		{"$sort": bson.M{"_id": -1}},
	}

	yearCursor, err := r.collection.Aggregate(ctx, yearlyPipeline)
	if err != nil {
		return nil, err
	}
	defer yearCursor.Close(ctx)

	var registrosAnuales []models.RegistroAnual
	totalAnual := 0
	for yearCursor.Next(ctx) {
		var result struct {
			Year  int `bson:"_id"`
			Total int `bson:"total"`
		}
		if err := yearCursor.Decode(&result); err != nil {
			continue
		}

		totalAnual += result.Total
		registrosAnuales = append(registrosAnuales, models.RegistroAnual{
			Ano:   result.Year,
			Total: result.Total,
		})
	}

	// Calculate percentages for yearly data
	for i := range registrosAnuales {
		if totalAnual > 0 {
			registrosAnuales[i].Porcentaje = (float64(registrosAnuales[i].Total) / float64(totalAnual)) * 100
		}
	}

	// Calculate trend (simplified)
	tendencia := "estable"
	if len(registrosMensuales) >= 2 {
		if registrosMensuales[0].Total > registrosMensuales[1].Total {
			tendencia = "creciente"
		} else if registrosMensuales[0].Total < registrosMensuales[1].Total {
			tendencia = "decreciente"
		}
	}

	return &models.EstadisticasTemporales{
		RegistrosPorMes:  registrosMensuales,
		RegistrosPorAno:  registrosAnuales,
		UltimosRegistros: int(countLast30),
		TendenciaMensual: tendencia,
	}, nil
}
