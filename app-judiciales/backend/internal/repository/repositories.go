package repository

import (
	"expedientes-backend/internal/database"
)

// ExpedienteRepository handles expediente data operations
type ExpedienteRepository struct {
	db *database.Database
}

// NewExpedienteRepository creates a new expediente repository
func NewExpedienteRepository(db *database.Database) *ExpedienteRepository {
	return &ExpedienteRepository{db: db}
}

// MovimientoRepository handles movimiento data operations
type MovimientoRepository struct {
	db *database.Database
}

// NewMovimientoRepository creates a new movimiento repository
func NewMovimientoRepository(db *database.Database) *MovimientoRepository {
	return &MovimientoRepository{db: db}
}

// JuzgadoRepository handles juzgado data operations
type JuzgadoRepository struct {
	db *database.Database
}

// NewJuzgadoRepository creates a new juzgado repository
func NewJuzgadoRepository(db *database.Database) *JuzgadoRepository {
	return &JuzgadoRepository{db: db}
}
