package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Juzgado represents a court/tribunal
type Juzgado struct {
	ID             primitive.ObjectID   `json:"id" bson:"_id,omitempty"`
	Nombre         string               `json:"nombre" bson:"nombre" binding:"required"`
	Tipo           TipoJuzgado          `json:"tipo" bson:"tipo" binding:"required"`
	Competencias   []string             `json:"competencias" bson:"competencias"`
	JuezTitular    primitive.ObjectID   `json:"juez_titular" bson:"juez_titular"`
	Secretarios    []primitive.ObjectID `json:"secretarios" bson:"secretarios"`
	Direccion      string               `json:"direccion" bson:"direccion"`
	Telefono       string               `json:"telefono" bson:"telefono"`
	Email          string               `json:"email" bson:"email"`
	Activo         bool                 `json:"activo" bson:"activo"`
	SalasAudiencia []SalaAudiencia      `json:"salas_audiencia" bson:"salas_audiencia"`
	CreatedAt      time.Time            `json:"created_at" bson:"created_at"`
	UpdatedAt      time.Time            `json:"updated_at" bson:"updated_at"`
}

// TipoJuzgado represents the type of court
type TipoJuzgado string

const (
	JuzgadoCivil       TipoJuzgado = "civil"
	JuzgadoPenal       TipoJuzgado = "penal"
	JuzgadoLaboral     TipoJuzgado = "laboral"
	JuzgadoFamilia     TipoJuzgado = "familia"
	JuzgadoComercial   TipoJuzgado = "comercial"
	JuzgadoContencioso TipoJuzgado = "contencioso"
	JuzgadoPaz         TipoJuzgado = "paz"
	JuzgadoSupremo     TipoJuzgado = "supremo"
)

// SalaAudiencia represents a hearing room
type SalaAudiencia struct {
	Numero       string   `json:"numero" bson:"numero" binding:"required"`
	Nombre       string   `json:"nombre" bson:"nombre"`
	Capacidad    int      `json:"capacidad" bson:"capacidad"`
	Equipamiento []string `json:"equipamiento" bson:"equipamiento"`
	Activa       bool     `json:"activa" bson:"activa"`
}

// JuzgadoResponse represents juzgado with populated references
type JuzgadoResponse struct {
	Juzgado
	JuezTitularInfo *UserResponse  `json:"juez_titular_info,omitempty"`
	SecretariosInfo []UserResponse `json:"secretarios_info,omitempty"`
}

// JuzgadoSearchParams represents search parameters for juzgados
type JuzgadoSearchParams struct {
	Nombre      string      `form:"nombre"`
	Tipo        TipoJuzgado `form:"tipo"`
	Activo      *bool       `form:"activo"`
	JuezTitular string      `form:"juez_titular"`
	Page        int         `form:"page"`
	Limit       int         `form:"limit"`
	SortBy      string      `form:"sort_by"`
	SortOrder   string      `form:"sort_order"`
}
