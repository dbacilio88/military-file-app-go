package models

import "time"

// APIResponse represents a standard API response
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
}

// APIError represents an API error
type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

// PaginatedResponse represents a paginated API response
type PaginatedResponse struct {
	Success    bool           `json:"success"`
	Message    string         `json:"message,omitempty"`
	Data       interface{}    `json:"data"`
	Pagination PaginationInfo `json:"pagination"`
	Error      *APIError      `json:"error,omitempty"`
}

// PaginationInfo represents pagination information
type PaginationInfo struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
}

// DashboardStats represents dashboard statistics
type DashboardStats struct {
	TotalExpedientes      int64                  `json:"total_expedientes"`
	ExpedientesActivos    int64                  `json:"expedientes_activos"`
	ExpedientesPorEstado  map[string]int64       `json:"expedientes_por_estado"`
	ExpedientesPorTipo    map[string]int64       `json:"expedientes_por_tipo"`
	NuevosEsteMes         int64                  `json:"nuevos_este_mes"`
	ProximasAudiencias    []ProximaAudiencia     `json:"proximas_audiencias"`
	ExpedientesVencidos   int64                  `json:"expedientes_vencidos"`
	MovimientosRecientes  []MovimientoReciente   `json:"movimientos_recientes"`
	CargaProcesalJuzgados []CargaProcesalJuzgado `json:"carga_procesal_juzgados"`
}

// ProximaAudiencia represents an upcoming hearing
type ProximaAudiencia struct {
	ExpedienteID     string    `json:"expediente_id"`
	NumeroExpediente string    `json:"numero_expediente"`
	TipoAudiencia    string    `json:"tipo_audiencia"`
	Fecha            time.Time `json:"fecha"`
	Sala             string    `json:"sala"`
	Juzgado          string    `json:"juzgado"`
}

// MovimientoReciente represents a recent movement
type MovimientoReciente struct {
	ID               string    `json:"id"`
	ExpedienteID     string    `json:"expediente_id"`
	NumeroExpediente string    `json:"numero_expediente"`
	Tipo             string    `json:"tipo"`
	Descripcion      string    `json:"descripcion"`
	Fecha            time.Time `json:"fecha"`
	Usuario          string    `json:"usuario"`
}

// CargaProcesalJuzgado represents the caseload for a court
type CargaProcesalJuzgado struct {
	JuzgadoID     string  `json:"juzgado_id"`
	NombreJuzgado string  `json:"nombre_juzgado"`
	TotalCasos    int64   `json:"total_casos"`
	CasosActivos  int64   `json:"casos_activos"`
	Porcentaje    float64 `json:"porcentaje"`
}

// FilterParams represents common filter parameters
type FilterParams struct {
	Search    string    `form:"search"`
	Page      int       `form:"page"`
	Limit     int       `form:"limit"`
	SortBy    string    `form:"sort_by"`
	SortOrder string    `form:"sort_order"`
	StartDate time.Time `form:"start_date"`
	EndDate   time.Time `form:"end_date"`
}

// AuditLog represents an audit log entry
type AuditLog struct {
	ID        string                 `json:"id" bson:"_id,omitempty"`
	UsuarioID string                 `json:"usuario_id" bson:"usuario_id"`
	Usuario   string                 `json:"usuario" bson:"usuario"`
	Accion    string                 `json:"accion" bson:"accion"`
	Recurso   string                 `json:"recurso" bson:"recurso"`
	RecursoID string                 `json:"recurso_id" bson:"recurso_id"`
	IP        string                 `json:"ip" bson:"ip"`
	UserAgent string                 `json:"user_agent" bson:"user_agent"`
	Detalles  map[string]interface{} `json:"detalles" bson:"detalles"`
	Timestamp time.Time              `json:"timestamp" bson:"timestamp"`
}
