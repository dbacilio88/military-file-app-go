package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Expediente represents a military/academic personnel record
type Expediente struct {
	ID                 primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	Grado              string              `json:"grado" bson:"grado" binding:"required"`
	ApellidosNombres   string              `json:"apellidos_nombres" bson:"apellidos_nombres" binding:"required"`
	NumeroPaginas      int                 `json:"numero_paginas" bson:"numero_paginas" binding:"required,min=1"`
	SituacionMilitar   string              `json:"situacion_militar" bson:"situacion_militar" binding:"required"`
	CIP                string              `json:"cip" bson:"cip" binding:"required"`
	Estado             EstadoExpediente    `json:"estado" bson:"estado"`
	Ubicacion          string              `json:"ubicacion" bson:"ubicacion" binding:"required"`
	FechaRegistro      time.Time           `json:"fecha_registro" bson:"fecha_registro"`
	FechaActualizacion time.Time           `json:"fecha_actualizacion" bson:"fecha_actualizacion"`
	Orden              int                 `json:"orden" bson:"orden" binding:"required,min=1"`
	CreatedAt          time.Time           `json:"created_at" bson:"createdAt"`
	UpdatedAt          time.Time           `json:"updated_at" bson:"updatedAt"`
	CreatedBy          primitive.ObjectID  `json:"created_by" bson:"createdBy"`
	UpdatedBy          primitive.ObjectID  `json:"updated_by" bson:"updatedBy"`
	DeletedAt          *time.Time          `json:"deleted_at,omitempty" bson:"deletedAt,omitempty"`
	DeletedBy          *primitive.ObjectID `json:"deleted_by,omitempty" bson:"deletedBy,omitempty"`
}

// EstadoExpediente represents the state of the record
type EstadoExpediente string

const (
	EstadoDentro EstadoExpediente = "dentro"
	EstadoFuera  EstadoExpediente = "fuera"
)

// ExpedienteSearchParams represents search parameters for expedientes
type ExpedienteSearchParams struct {
	Grado            string           `form:"grado"`
	ApellidosNombres string           `form:"apellidos_nombres"`
	SituacionMilitar string           `form:"situacion_militar"`
	CIP              string           `form:"cip"`
	Estado           EstadoExpediente `form:"estado"`
	Ubicacion        string           `form:"ubicacion"`
	Orden            int              `form:"orden"`
	FechaInicio      time.Time        `form:"fecha_inicio"`
	FechaFin         time.Time        `form:"fecha_fin"`
	Page             int              `form:"page"`
	Limit            int              `form:"limit"`
	SortBy           string           `form:"sort_by"`
	SortOrder        string           `form:"sort_order"`
}

// CreateExpedienteRequest represents the request for creating a new expediente
type CreateExpedienteRequest struct {
	Grado            string `json:"grado" binding:"required"`
	ApellidosNombres string `json:"apellidos_nombres" binding:"required"`
	NumeroPaginas    int    `json:"numero_paginas" binding:"required,min=1"`
	SituacionMilitar string `json:"situacion_militar" binding:"required"`
	CIP              string `json:"cip" binding:"required"`
	Ubicacion        string `json:"ubicacion" binding:"required"`
	Orden            int    `json:"orden" binding:"required,min=1"`
}

// UpdateExpedienteRequest represents the request for updating an expediente
type UpdateExpedienteRequest struct {
	Grado            *string           `json:"grado,omitempty"`
	ApellidosNombres *string           `json:"apellidos_nombres,omitempty"`
	NumeroPaginas    *int              `json:"numero_paginas,omitempty"`
	SituacionMilitar *string           `json:"situacion_militar,omitempty"`
	CIP              *string           `json:"cip,omitempty"`
	Estado           *EstadoExpediente `json:"estado,omitempty"`
	Ubicacion        *string           `json:"ubicacion,omitempty"`
	Orden            *int              `json:"orden,omitempty"`
}

// ExpedienteResponse represents expediente response with metadata
type ExpedienteResponse struct {
	Expediente
	TotalPaginas int `json:"total_paginas,omitempty"`
}
