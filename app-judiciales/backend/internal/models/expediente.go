package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Grado represents military rank
type Grado string

const (
	// Oficiales
	GradoGRAL   Grado = "GRAL"
	GradoCRL    Grado = "CRL"
	GradoTTECRL Grado = "TTE CRL"
	GradoMY     Grado = "MY"
	GradoCAP    Grado = "CAP"
	GradoTTE    Grado = "TTE"
	GradoSTTE   Grado = "STTE"

	// TCO y SSOO
	GradoTCO  Grado = "TCO"
	GradoSSOO Grado = "SSOO"

	// Otros
	GradoEC    Grado = "EC"
	GradoTropa Grado = "TROPA"
)

// SituacionMilitar represents military status
type SituacionMilitar string

const (
	SituacionActividad SituacionMilitar = "Actividad"
	SituacionRetiro    SituacionMilitar = "Retiro"
)

// EstadoExpediente represents the state of the record
type EstadoExpediente string

const (
	EstadoDentro EstadoExpediente = "dentro"
	EstadoFuera  EstadoExpediente = "fuera"
)

// Expediente represents a military/judicial personnel record
type Expediente struct {
	ID                 primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	Grado              Grado               `json:"grado" bson:"grado" binding:"required" validate:"required,oneof=GRAL CRL 'TTE CRL' MY CAP TTE STTE TCO SSOO EC TROPA"`
	ApellidosNombres   string              `json:"apellidos_nombres" bson:"apellidos_nombres" binding:"required" validate:"required,min=3"`
	NumeroPaginas      int                 `json:"numero_paginas" bson:"numero_paginas" binding:"required,min=1" validate:"required,min=1"`
	SituacionMilitar   SituacionMilitar    `json:"situacion_militar" bson:"situacion_militar" binding:"required" validate:"required,oneof=Actividad Retiro"`
	CIP                string              `json:"cip" bson:"cip" binding:"required" validate:"required"`
	Estado             EstadoExpediente    `json:"estado" bson:"estado" validate:"required,oneof=dentro fuera"`
	Ubicacion          string              `json:"ubicacion" bson:"ubicacion" binding:"required" validate:"required"`
	Ano                int                 `json:"ano" bson:"ano" binding:"required,min=1900,max=2100" validate:"required,min=1900,max=2100"`
	FechaRegistro      time.Time           `json:"fecha_registro" bson:"fecha_registro" validate:"required"`
	FechaActualizacion time.Time           `json:"fecha_actualizacion" bson:"fecha_actualizacion" validate:"required"`
	Orden              int                 `json:"orden" bson:"orden" binding:"required,min=1" validate:"required,min=1"`
	CreatedAt          time.Time           `json:"created_at" bson:"createdAt"`
	UpdatedAt          time.Time           `json:"updated_at" bson:"updatedAt"`
	CreatedBy          primitive.ObjectID  `json:"created_by" bson:"createdBy"`
	UpdatedBy          primitive.ObjectID  `json:"updated_by" bson:"updatedBy"`
	DeletedAt          *time.Time          `json:"deleted_at,omitempty" bson:"deletedAt,omitempty"`
	DeletedBy          *primitive.ObjectID `json:"deleted_by,omitempty" bson:"deletedBy,omitempty"`
}

// ExpedienteSearchParams represents search parameters for expedientes
type ExpedienteSearchParams struct {
	Grado            Grado            `form:"grado"`
	ApellidosNombres string           `form:"apellidos_nombres"`
	SituacionMilitar SituacionMilitar `form:"situacion_militar"`
	CIP              string           `form:"cip"`
	Estado           EstadoExpediente `form:"estado"`
	Ubicacion        string           `form:"ubicacion"`
	Orden            int              `form:"orden"`
	Ano              int              `form:"ano"`
	FechaInicio      time.Time        `form:"fecha_inicio"`
	FechaFin         time.Time        `form:"fecha_fin"`
	Page             int              `form:"page"`
	Limit            int              `form:"limit"`
	SortBy           string           `form:"sort_by"`
	SortOrder        string           `form:"sort_order"`
}

// CreateExpedienteRequest represents the request for creating a new expediente
type CreateExpedienteRequest struct {
	Grado            Grado            `json:"grado" binding:"required" validate:"required,oneof=GRAL CRL 'TTE CRL' MY CAP TTE STTE TCO SSOO EC TROPA"`
	ApellidosNombres string           `json:"apellidos_nombres" binding:"required" validate:"required,min=3"`
	NumeroPaginas    int              `json:"numero_paginas" binding:"required,min=1" validate:"required,min=1"`
	SituacionMilitar SituacionMilitar `json:"situacion_militar" binding:"required" validate:"required,oneof=Actividad Retiro"`
	CIP              string           `json:"cip" binding:"required" validate:"required"`
	Ubicacion        string           `json:"ubicacion" binding:"required" validate:"required"`
	Orden            int              `json:"orden" binding:"required,min=1" validate:"required,min=1"`
	Ano              int              `json:"ano" binding:"required,min=1900,max=2100" validate:"required,min=1900,max=2100"`
}

// UpdateExpedienteRequest represents the request for updating an expediente
type UpdateExpedienteRequest struct {
	Grado            *Grado            `json:"grado,omitempty" validate:"omitempty,oneof=GRAL CRL 'TTE CRL' MY CAP TTE STTE TCO SSOO EC TROPA"`
	ApellidosNombres *string           `json:"apellidos_nombres,omitempty" validate:"omitempty,min=3"`
	NumeroPaginas    *int              `json:"numero_paginas,omitempty" validate:"omitempty,min=1"`
	SituacionMilitar *SituacionMilitar `json:"situacion_militar,omitempty" validate:"omitempty,oneof=Actividad Retiro"`
	CIP              *string           `json:"cip,omitempty"`
	Estado           *EstadoExpediente `json:"estado,omitempty" validate:"omitempty,oneof=dentro fuera"`
	Ubicacion        *string           `json:"ubicacion,omitempty"`
	Orden            *int              `json:"orden,omitempty" validate:"omitempty,min=1"`
	Ano              *int              `json:"ano,omitempty" validate:"omitempty,min=1900,max=2100"`
}

// ExpedienteResponse represents expediente response with metadata
type ExpedienteResponse struct {
	Expediente
	TotalPaginas int `json:"total_paginas,omitempty"`
}

// ExpedienteListResponse represents a paginated list of expedientes
type ExpedienteListResponse struct {
	Expedientes []Expediente `json:"expedientes"`
	Total       int64        `json:"total"`
	Page        int          `json:"page"`
	Limit       int          `json:"limit"`
	TotalPages  int          `json:"total_pages"`
}

// BulkImportExpediente represents a single expediente record from Excel
type BulkImportExpediente struct {
	Grado            string `json:"grado" excel:"Grado"`
	CIP              string `json:"cip" excel:"CIP"`
	ApellidosNombres string `json:"apellidos_nombres" excel:"ApellidosNombres"`
	NumeroPaginas    string `json:"numero_paginas" excel:"NumeroPaginas"`
	Ano              string `json:"ano" excel:"Ano"`
	Fila             int    `json:"fila,omitempty"`
}

// BulkImportResult represents the result of a bulk import operation
type BulkImportResult struct {
	TotalProcesados int                  `json:"total_procesados"`
	Exitosos        int                  `json:"exitosos"`
	Fallidos        int                  `json:"fallidos"`
	Errores         []BulkImportError    `json:"errores,omitempty"`
	Expedientes     []primitive.ObjectID `json:"expedientes_creados,omitempty"`
}

// BulkImportError represents an error during bulk import
type BulkImportError struct {
	Fila     int                  `json:"fila"`
	Campo    string               `json:"campo,omitempty"`
	Valor    string               `json:"valor,omitempty"`
	Error    string               `json:"error"`
	Registro BulkImportExpediente `json:"registro,omitempty"`
}

// Dashboard Statistics Models

// DashboardStats represents complete dashboard statistics
type DashboardStats struct {
	ResumenGeneral           ResumenGeneral         `json:"resumen_general"`
	EstadisticasPorGrado     []GradoStats           `json:"estadisticas_por_grado"`
	EstadisticasPorEstado    []EstadoStats          `json:"estadisticas_por_estado"`
	EstadisticasPorSituacion []SituacionStats       `json:"estadisticas_por_situacion"`
	EstadisticasPorUbicacion []UbicacionStats       `json:"estadisticas_por_ubicacion"`
	EstadisticasTemporales   EstadisticasTemporales `json:"estadisticas_temporales"`
	GeneradoEn               time.Time              `json:"generado_en"`
}

// ResumenGeneral represents general summary statistics
type ResumenGeneral struct {
	TotalExpedientes             int     `json:"total_expedientes"`
	ExpedientesDentro            int     `json:"expedientes_dentro"`
	ExpedientesFuera             int     `json:"expedientes_fuera"`
	PorcentajeDentro             float64 `json:"porcentaje_dentro"`
	PorcentajeFuera              float64 `json:"porcentaje_fuera"`
	PersonalActividad            int     `json:"personal_actividad"`
	PersonalRetiro               int     `json:"personal_retiro"`
	PorcentajeActividad          float64 `json:"porcentaje_actividad"`
	PorcentajeRetiro             float64 `json:"porcentaje_retiro"`
	PromedioPaginasPorExpediente float64 `json:"promedio_paginas_por_expediente"`
	TotalPaginas                 int     `json:"total_paginas"`
	UbicacionesUnicas            int     `json:"ubicaciones_unicas"`
}

// GradoStats represents statistics by military rank
type GradoStats struct {
	Grado        Grado   `json:"grado"`
	Total        int     `json:"total"`
	Dentro       int     `json:"dentro"`
	Fuera        int     `json:"fuera"`
	Actividad    int     `json:"actividad"`
	Retiro       int     `json:"retiro"`
	Porcentaje   float64 `json:"porcentaje"`
	TotalPaginas int     `json:"total_paginas"`
}

// EstadoStats represents statistics by state (dentro/fuera)
type EstadoStats struct {
	Estado       EstadoExpediente `json:"estado"`
	Total        int              `json:"total"`
	Porcentaje   float64          `json:"porcentaje"`
	TotalPaginas int              `json:"total_paginas"`
}

// SituacionStats represents statistics by military situation
type SituacionStats struct {
	Situacion    SituacionMilitar `json:"situacion"`
	Total        int              `json:"total"`
	Porcentaje   float64          `json:"porcentaje"`
	TotalPaginas int              `json:"total_paginas"`
}

// UbicacionStats represents statistics by location
type UbicacionStats struct {
	Ubicacion    string  `json:"ubicacion"`
	Total        int     `json:"total"`
	Porcentaje   float64 `json:"porcentaje"`
	TotalPaginas int     `json:"total_paginas"`
}

// EstadisticasTemporales represents time-based statistics
type EstadisticasTemporales struct {
	RegistrosPorMes  []RegistroMensual `json:"registros_por_mes"`
	RegistrosPorAno  []RegistroAnual   `json:"registros_por_ano"`
	UltimosRegistros int               `json:"ultimos_30_dias"`
	TendenciaMensual string            `json:"tendencia_mensual"` // "creciente", "decreciente", "estable"
}

// RegistroMensual represents monthly registration statistics
type RegistroMensual struct {
	Ano        int     `json:"ano"`
	Mes        int     `json:"mes"`
	MesNombre  string  `json:"mes_nombre"`
	Total      int     `json:"total"`
	Porcentaje float64 `json:"porcentaje"`
}

// RegistroAnual represents yearly registration statistics
type RegistroAnual struct {
	Ano        int     `json:"ano"`
	Total      int     `json:"total"`
	Porcentaje float64 `json:"porcentaje"`
}
