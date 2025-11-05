package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"

	"gopkg.in/yaml.v2"
)

func main() {
	// Leer el archivo YAML
	yamlFile, err := ioutil.ReadFile("docs/swagger.yaml")
	if err != nil {
		log.Fatalf("Error leyendo archivo YAML: %v", err)
	}

	// Parsear YAML
	var yamlData interface{}
	err = yaml.Unmarshal(yamlFile, &yamlData)
	if err != nil {
		log.Fatalf("Error parseando YAML: %v", err)
	}

	// Convertir a JSON compatible
	jsonData := convertYamlToJsonValue(yamlData)

	// Convertir a JSON
	jsonBytes, err := json.MarshalIndent(jsonData, "", "  ")
	if err != nil {
		log.Fatalf("Error convirtiendo a JSON: %v", err)
	}

	// Verificar campos específicos
	if dataMap, ok := jsonData.(map[string]interface{}); ok {
		fmt.Printf("OpenAPI version: %v\n", dataMap["openapi"])
		if info, ok := dataMap["info"].(map[string]interface{}); ok {
			fmt.Printf("Title: %v\n", info["title"])
			fmt.Printf("Version: %v\n", info["version"])
		}
	}

	fmt.Printf("JSON length: %d bytes\n", len(jsonBytes))
	fmt.Printf("First 500 chars:\n%s\n", string(jsonBytes[:min(500, len(jsonBytes))]))
}

func convertYamlToJsonValue(data interface{}) interface{} {
	switch v := data.(type) {
	case map[interface{}]interface{}:
		converted := make(map[string]interface{})
		for key, value := range v {
			keyStr := fmt.Sprintf("%v", key)
			converted[keyStr] = convertYamlToJsonValue(value)
		}
		return converted
	case []interface{}:
		converted := make([]interface{}, len(v))
		for i, value := range v {
			converted[i] = convertYamlToJsonValue(value)
		}
		return converted
	default:
		return v
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
