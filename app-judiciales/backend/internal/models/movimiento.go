package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Movimiento represents a judicial action/movement in a case
type Movimiento struct {
	ID            primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	ExpedienteID  primitive.ObjectID `json:"expediente_id" bson:"expediente_id" binding:"required"`
	Numero        int                `json:"numero" bson:"numero"`
	Tipo          TipoMovimiento     `json:"tipo" bson:"tipo" binding:"required"`
	Descripcion   string             `json:"descripcion" bson:"descripcion" binding:"required"`
	Fecha         time.Time          `json:"fecha" bson:"fecha"`
	UsuarioID     primitive.ObjectID `json:"usuario_id" bson:"usuario_id"`
	Observaciones string             `json:"observaciones" bson:"observaciones"`
	Documentos    []Documento        `json:"documentos" bson:"documentos"`
	Notificacion  *Notificacion      `json:"notificacion,omitempty" bson:"notificacion,omitempty"`
	CreatedAt     time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at" bson:"updated_at"`
}

// TipoMovimiento represents the type of movement
type TipoMovimiento string

const (
	TipoIngresoDemanda    TipoMovimiento = "ingreso_demanda"
	TipoActuacionJudicial TipoMovimiento = "actuacion_judicial"
	TipoResolucion        TipoMovimiento = "resolucion"
	TipoAuto              TipoMovimiento = "auto"
	TipoSentencia         TipoMovimiento = "sentencia"
	TipoNotificacion      TipoMovimiento = "notificacion"
	TipoAudiencia         TipoMovimiento = "audiencia"
	TipoArchivo           TipoMovimiento = "archivo"
	TipoEscrito           TipoMovimiento = "escrito"
	TipoOficio            TipoMovimiento = "oficio"
)

// Documento represents a document attached to a movement
type Documento struct {
	ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Nombre       string             `json:"nombre" bson:"nombre" binding:"required"`
	TipoArchivo  string             `json:"tipo_archivo" bson:"tipo_archivo"`
	Tamano       int64              `json:"tamano" bson:"tamano"`
	RutaArchivo  string             `json:"ruta_archivo" bson:"ruta_archivo"`
	Hash         string             `json:"hash" bson:"hash"`
	Descripcion  string             `json:"descripcion" bson:"descripcion"`
	Confidencial bool               `json:"confidencial" bson:"confidencial"`
	SubidoPor    primitive.ObjectID `json:"subido_por" bson:"subido_por"`
	FechaSubida  time.Time          `json:"fecha_subida" bson:"fecha_subida"`
}

// Notificacion represents a notification related to a movement
type Notificacion struct {
	Metodo            MetodoNotificacion `json:"metodo" bson:"metodo" binding:"required"`
	Estado            EstadoNotificacion `json:"estado" bson:"estado"`
	FechaNotificacion time.Time          `json:"fecha_notificacion" bson:"fecha_notificacion"`
	Receptor          string             `json:"receptor" bson:"receptor" binding:"required"`
	Direccion         string             `json:"direccion" bson:"direccion"`
	Observaciones     string             `json:"observaciones" bson:"observaciones"`
	FechaDevolucion   *time.Time         `json:"fecha_devolucion,omitempty" bson:"fecha_devolucion,omitempty"`
	MotivoDevolucion  string             `json:"motivo_devolucion" bson:"motivo_devolucion"`
}

// MetodoNotificacion represents the notification method
type MetodoNotificacion string

const (
	MetodoCedula   MetodoNotificacion = "cedula"
	MetodoEdictos  MetodoNotificacion = "edictos"
	MetodoEmail    MetodoNotificacion = "email"
	MetodoOficio   MetodoNotificacion = "oficio"
	MetodoPersonal MetodoNotificacion = "personal"
)

// EstadoNotificacion represents the notification status
type EstadoNotificacion string

const (
	NotificacionPendiente EstadoNotificacion = "pendiente"
	NotificacionEntregada EstadoNotificacion = "entregada"
	NotificacionDevuelta  EstadoNotificacion = "devuelta"
	NotificacionVencida   EstadoNotificacion = "vencida"
)

// MovimientoResponse represents movement with populated references
type MovimientoResponse struct {
	Movimiento
	Usuario    *UserResponse       `json:"usuario,omitempty"`
	Expediente *ExpedienteResponse `json:"expediente,omitempty"`
}

// MovimientoSearchParams represents search parameters for movements
type MovimientoSearchParams struct {
	ExpedienteID string         `form:"expediente_id"`
	Tipo         TipoMovimiento `form:"tipo"`
	FechaInicio  time.Time      `form:"fecha_inicio"`
	FechaFin     time.Time      `form:"fecha_fin"`
	UsuarioID    string         `form:"usuario_id"`
	Page         int            `form:"page"`
	Limit        int            `form:"limit"`
	SortBy       string         `form:"sort_by"`
	SortOrder    string         `form:"sort_order"`
}
