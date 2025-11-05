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
