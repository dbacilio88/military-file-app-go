package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func User() {
	baseURL := "http://localhost:8082/api/v1"

	// Test cases for user validation
	testCases := []struct {
		name        string
		userData    map[string]interface{}
		shouldFail  bool
		description string
	}{
		{
			name: "valid_user",
			userData: map[string]interface{}{
				"email":      "test@tribunal.com",
				"password":   "Test123!@#",
				"nombre":     "Juan",
				"apellido":   "Pérez",
				"documento":  "12345678",
				"telefono":   "987654321",
				"profile_id": "673876717551dcdff4d4c26f", // ID de perfil válido
			},
			shouldFail:  false,
			description: "Usuario válido con todos los campos correctos",
		},
		{
			name: "invalid_documento_short",
			userData: map[string]interface{}{
				"email":      "test2@tribunal.com",
				"password":   "Test123!@#",
				"nombre":     "María",
				"apellido":   "García",
				"documento":  "1234567", // Solo 7 dígitos
				"telefono":   "987654321",
				"profile_id": "673876717551dcdff4d4c26f",
			},
			shouldFail:  true,
			description: "Documento con menos de 8 dígitos",
		},
		{
			name: "invalid_documento_long",
			userData: map[string]interface{}{
				"email":      "test3@tribunal.com",
				"password":   "Test123!@#",
				"nombre":     "Carlos",
				"apellido":   "López",
				"documento":  "123456789", // 9 dígitos
				"telefono":   "987654321",
				"profile_id": "673876717551dcdff4d4c26f",
			},
			shouldFail:  true,
			description: "Documento con más de 8 dígitos",
		},
		{
			name: "invalid_documento_non_numeric",
			userData: map[string]interface{}{
				"email":      "test4@tribunal.com",
				"password":   "Test123!@#",
				"nombre":     "Ana",
				"apellido":   "Martínez",
				"documento":  "1234567A", // Contiene letra
				"telefono":   "987654321",
				"profile_id": "673876717551dcdff4d4c26f",
			},
			shouldFail:  true,
			description: "Documento con caracteres no numéricos",
		},
		{
			name: "invalid_telefono_short",
			userData: map[string]interface{}{
				"email":      "test5@tribunal.com",
				"password":   "Test123!@#",
				"nombre":     "Luis",
				"apellido":   "Rodríguez",
				"documento":  "87654321",
				"telefono":   "98765432", // Solo 8 dígitos
				"profile_id": "673876717551dcdff4d4c26f",
			},
			shouldFail:  true,
			description: "Teléfono con menos de 9 dígitos",
		},
		{
			name: "invalid_telefono_long",
			userData: map[string]interface{}{
				"email":      "test6@tribunal.com",
				"password":   "Test123!@#",
				"nombre":     "Elena",
				"apellido":   "Fernández",
				"documento":  "76543210",
				"telefono":   "9876543210", // 10 dígitos
				"profile_id": "673876717551dcdff4d4c26f",
			},
			shouldFail:  true,
			description: "Teléfono con más de 9 dígitos",
		},
		{
			name: "invalid_telefono_non_numeric",
			userData: map[string]interface{}{
				"email":      "test7@tribunal.com",
				"password":   "Test123!@#",
				"nombre":     "Pedro",
				"apellido":   "Sánchez",
				"documento":  "65432109",
				"telefono":   "98765432A", // Contiene letra
				"profile_id": "673876717551dcdff4d4c26f",
			},
			shouldFail:  true,
			description: "Teléfono con caracteres no numéricos",
		},
		{
			name: "duplicate_email",
			userData: map[string]interface{}{
				"email":      "admin@tribunal.com", // Email ya existente
				"password":   "Test123!@#",
				"nombre":     "Admin",
				"apellido":   "Duplicado",
				"documento":  "11111111",
				"telefono":   "111111111",
				"profile_id": "673876717551dcdff4d4c26f",
			},
			shouldFail:  true,
			description: "Email duplicado (ya existe admin@tribunal.com)",
		},
		{
			name: "valid_user_no_phone",
			userData: map[string]interface{}{
				"email":     "test8@tribunal.com",
				"password":  "Test123!@#",
				"nombre":    "Rosa",
				"apellido":  "Morales",
				"documento": "55555555",
				// telefono omitido (opcional)
				"profile_id": "673876717551dcdff4d4c26f",
			},
			shouldFail:  false,
			description: "Usuario válido sin teléfono (campo opcional)",
		},
	}

	// Get admin token first
	loginData := map[string]string{
		"email":    "admin@tribunal.com",
		"password": "Admin123!@#",
	}

	loginJSON, _ := json.Marshal(loginData)
	resp, err := http.Post(baseURL+"/auth/login", "application/json", bytes.NewBuffer(loginJSON))
	if err != nil {
		fmt.Printf("Error al hacer login: %v\n", err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var loginResp map[string]interface{}
	json.Unmarshal(body, &loginResp)

	if data, ok := loginResp["data"].(map[string]interface{}); ok {
		if token, ok := data["access_token"].(string); ok {
			fmt.Printf("🔑 Token obtenido exitosamente\n\n")

			// Run test cases
			fmt.Println("🧪 PROBANDO VALIDACIONES DE USUARIO")
			fmt.Println("=====================================")

			for i, tc := range testCases {
				fmt.Printf("\n%d. %s\n", i+1, tc.description)
				fmt.Printf("   Debería fallar: %v\n", tc.shouldFail)

				userJSON, _ := json.Marshal(tc.userData)
				req, _ := http.NewRequest("POST", baseURL+"/users", bytes.NewBuffer(userJSON))
				req.Header.Set("Content-Type", "application/json")
				req.Header.Set("Authorization", "Bearer "+token)

				client := &http.Client{}
				resp, err := client.Do(req)
				if err != nil {
					fmt.Printf("   ❌ Error en request: %v\n", err)
					continue
				}
				defer resp.Body.Close()

				respBody, _ := io.ReadAll(resp.Body)
				var result map[string]interface{}
				json.Unmarshal(respBody, &result)

				success := false
				if s, ok := result["success"].(bool); ok {
					success = s
				}

				if tc.shouldFail {
					if !success {
						fmt.Printf("   ✅ CORRECTO: Falló como esperado\n")
						if errorMsg, ok := result["error"].(string); ok {
							fmt.Printf("   📝 Error: %s\n", errorMsg)
						}
					} else {
						fmt.Printf("   ❌ ERROR: Debería haber fallado pero fue exitoso\n")
					}
				} else {
					if success {
						fmt.Printf("   ✅ CORRECTO: Exitoso como esperado\n")
					} else {
						fmt.Printf("   ❌ ERROR: Debería haber sido exitoso pero falló\n")
						if errorMsg, ok := result["error"].(string); ok {
							fmt.Printf("   📝 Error: %s\n", errorMsg)
						}
					}
				}
			}

			fmt.Println("\n=====================================")
			fmt.Println("🏁 PRUEBAS DE VALIDACIÓN COMPLETADAS")
		}
	} else {
		fmt.Printf("Error en login: %v\n", loginResp)
	}
}
