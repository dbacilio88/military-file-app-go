package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const baseURL = "http://localhost:8080"

func Validations() {
	fmt.Println("🧪 Probando validaciones de usuario...")

	// Test 1: Documento debe ser numérico y 8 dígitos
	fmt.Println("\n📋 Test 1: Validación de documento")
	testDocumentValidation()

	// Test 2: Teléfono debe ser numérico y 9 dígitos
	fmt.Println("\n📞 Test 2: Validación de teléfono")
	testPhoneValidation()

	// Test 3: Email único
	fmt.Println("\n📧 Test 3: Validación de email único")
	testEmailUniqueness()

	// Test 4: Documento único
	fmt.Println("\n📄 Test 4: Validación de documento único")
	testDocumentUniqueness()

	// Test 5: Profile name único
	fmt.Println("\n🏷️ Test 5: Validación de nombre de perfil único")
	testProfileNameUniqueness()

	fmt.Println("\n✅ Todas las pruebas completadas")
}

func testDocumentValidation() {
	// Test documento inválido (no numérico)
	user := map[string]interface{}{
		"email":      "test1@test.com",
		"password":   "password123",
		"nombre":     "Test",
		"apellido":   "User",
		"documento":  "ABC12345", // Inválido: no numérico
		"telefono":   "987654321",
		"profile_id": "690a27ed7551dcdff4d4c26f",
	}

	resp := makeRequest("POST", "/api/v1/users", user)
	if resp != nil && resp["success"] == false {
		fmt.Println("   ✅ Documento no numérico rechazado correctamente")
	} else {
		fmt.Println("   ❌ Documento no numérico no fue rechazado")
	}

	// Test documento inválido (longitud incorrecta)
	user["documento"] = "1234567" // Inválido: 7 dígitos
	resp = makeRequest("POST", "/api/v1/users", user)
	if resp != nil && resp["success"] == false {
		fmt.Println("   ✅ Documento con longitud incorrecta rechazado correctamente")
	} else {
		fmt.Println("   ❌ Documento con longitud incorrecta no fue rechazado")
	}
}

func testPhoneValidation() {
	// Test teléfono inválido (no numérico)
	user := map[string]interface{}{
		"email":      "test2@test.com",
		"password":   "password123",
		"nombre":     "Test",
		"apellido":   "User",
		"documento":  "12345678",
		"telefono":   "98-765-432", // Inválido: no numérico
		"profile_id": "690a27ed7551dcdff4d4c26f",
	}

	resp := makeRequest("POST", "/api/v1/users", user)
	if resp != nil && resp["success"] == false {
		fmt.Println("   ✅ Teléfono no numérico rechazado correctamente")
	} else {
		fmt.Println("   ❌ Teléfono no numérico no fue rechazado")
	}

	// Test teléfono inválido (longitud incorrecta)
	user["telefono"] = "98765432" // Inválido: 8 dígitos
	resp = makeRequest("POST", "/api/v1/users", user)
	if resp != nil && resp["success"] == false {
		fmt.Println("   ✅ Teléfono con longitud incorrecta rechazado correctamente")
	} else {
		fmt.Println("   ❌ Teléfono con longitud incorrecta no fue rechazado")
	}
}

func testEmailUniqueness() {
	// Intentar crear usuario con email que ya existe (admin@tribunal.com)
	user := map[string]interface{}{
		"email":      "admin@tribunal.com", // Email que ya existe
		"password":   "password123",
		"nombre":     "Test",
		"apellido":   "User",
		"documento":  "87654321",
		"telefono":   "987654321",
		"profile_id": "690a27ed7551dcdff4d4c26f",
	}

	resp := makeRequest("POST", "/api/v1/users", user)
	if resp != nil && resp["success"] == false {
		fmt.Println("   ✅ Email duplicado rechazado correctamente")
	} else {
		fmt.Println("   ❌ Email duplicado no fue rechazado")
	}
}

func testDocumentUniqueness() {
	// Crear un usuario válido primero
	user1 := map[string]interface{}{
		"email":      "unique1@test.com",
		"password":   "password123",
		"nombre":     "Test",
		"apellido":   "User1",
		"documento":  "11111111",
		"telefono":   "987654321",
		"profile_id": "690a27ed7551dcdff4d4c26f",
	}

	resp1 := makeRequest("POST", "/api/v1/users", user1)
	if resp1 != nil && resp1["success"] == true {
		fmt.Println("   ✅ Usuario 1 creado correctamente")

		// Intentar crear otro usuario con el mismo documento
		user2 := map[string]interface{}{
			"email":      "unique2@test.com",
			"password":   "password123",
			"nombre":     "Test",
			"apellido":   "User2",
			"documento":  "11111111", // Mismo documento
			"telefono":   "987654322",
			"profile_id": "690a27ed7551dcdff4d4c26f",
		}

		resp2 := makeRequest("POST", "/api/v1/users", user2)
		if resp2 != nil && resp2["success"] == false {
			fmt.Println("   ✅ Documento duplicado rechazado correctamente")
		} else {
			fmt.Println("   ❌ Documento duplicado no fue rechazado")
		}
	} else {
		fmt.Println("   ❌ No se pudo crear usuario 1 para la prueba")
	}
}

func testProfileNameUniqueness() {
	// Obtener token de administrador primero
	loginResp := makeRequest("POST", "/api/v1/auth/login", map[string]interface{}{
		"email":    "admin@tribunal.com",
		"password": "Admin123!@#",
	})

	if loginResp == nil || loginResp["success"] != true {
		fmt.Println("   ❌ No se pudo obtener token de administrador")
		return
	}

	// Intentar crear perfil con nombre que ya existe
	profile := map[string]interface{}{
		"name":        "Administrador", // Nombre que puede ya existir
		"slug":        "administrador-test",
		"description": "Test profile",
		"permissions": []string{"system:read"},
	}

	resp := makeRequest("POST", "/api/v1/admin/profiles", profile)
	if resp != nil && resp["success"] == false {
		fmt.Println("   ✅ Nombre de perfil duplicado rechazado correctamente")
	} else {
		fmt.Println("   ⚠️ Puede que el nombre no esté duplicado o falte el endpoint")
	}
}

func makeRequest(method, endpoint string, data interface{}) map[string]interface{} {
	var body io.Reader
	if data != nil {
		jsonData, _ := json.Marshal(data)
		body = bytes.NewBuffer(jsonData)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest(method, baseURL+endpoint, body)
	if err != nil {
		fmt.Printf("   ❌ Error creando request: %v\n", err)
		return nil
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("   ⚠️ Error en request (servidor puede estar apagado): %v\n", err)
		return nil
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("   ❌ Error leyendo response: %v\n", err)
		return nil
	}

	var result map[string]interface{}
	if err := json.Unmarshal(responseBody, &result); err != nil {
		fmt.Printf("   ❌ Error parsing JSON: %v\n", err)
		return nil
	}

	return result
}
