package main

import (
	"encoding/json"
	"expedientes-backend/internal/models"
	"fmt"
	"time"
)

func main() {
	fmt.Println("=== Prueba del campo 'ano' en el modelo Expediente ===")

	// Test CreateExpedienteRequest
	createReq := models.CreateExpedienteRequest{
		Grado:            models.GradoCAP,
		ApellidosNombres: "Test, Usuario",
		NumeroPaginas:    10,
		SituacionMilitar: models.SituacionActividad,
		CIP:              "12345678",
		Ubicacion:        "Archivo Central",
		Orden:            1,
		Ano:              2024,
	}

	fmt.Println("1. CreateExpedienteRequest:")
	fmt.Printf("   Ano: %d\n", createReq.Ano)

	// Test Expediente model
	expediente := models.Expediente{
		Grado:              createReq.Grado,
		ApellidosNombres:   createReq.ApellidosNombres,
		NumeroPaginas:      createReq.NumeroPaginas,
		SituacionMilitar:   createReq.SituacionMilitar,
		CIP:                createReq.CIP,
		Estado:             models.EstadoDentro,
		Ubicacion:          createReq.Ubicacion,
		Ano:                createReq.Ano,
		FechaRegistro:      time.Now(),
		FechaActualizacion: time.Now(),
		Orden:              createReq.Orden,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	fmt.Println("\n2. Expediente model:")
	fmt.Printf("   Ano: %d\n", expediente.Ano)

	// Test UpdateExpedienteRequest
	updateAno := 2025
	updateReq := models.UpdateExpedienteRequest{
		Ano: &updateAno,
	}

	fmt.Println("\n3. UpdateExpedienteRequest:")
	fmt.Printf("   Ano: %d\n", *updateReq.Ano)

	// Test JSON serialization
	expedienteJSON, err := json.MarshalIndent(expediente, "", "  ")
	if err != nil {
		fmt.Printf("Error en JSON marshaling: %v\n", err)
		return
	}

	fmt.Println("\n4. JSON serialization del expediente:")
	fmt.Println(string(expedienteJSON))

	// Test ExpedienteSearchParams
	searchParams := models.ExpedienteSearchParams{
		Ano:   2024,
		Grado: models.GradoCAP,
		Page:  1,
		Limit: 10,
	}

	fmt.Println("\n5. ExpedienteSearchParams:")
	fmt.Printf("   Ano: %d\n", searchParams.Ano)

	// Test BulkImportExpediente
	bulkImport := models.BulkImportExpediente{
		Grado:            "CAP",
		CIP:              "87654321",
		ApellidosNombres: "Pérez, María",
		NumeroPaginas:    "15",
		Ano:              "2024",
		Fila:             2,
	}

	fmt.Println("\n6. BulkImportExpediente:")
	fmt.Printf("   Ano: %s\n", bulkImport.Ano)

	fmt.Println("\n=== Prueba completada exitosamente ===")
}
