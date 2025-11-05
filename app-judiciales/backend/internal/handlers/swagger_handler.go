package handlers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"gopkg.in/yaml.v2"
)

// Content type constants
const (
	ContentTypeJSON   = "application/json"
	ContentTypeYAML   = "application/x-yaml"
	ContentTypeHTML   = "text/html"
	HeaderContentType = "Content-Type"
)

// Error message constants
const (
	ErrLoadingSwagger = "Error loading swagger documentation: %v"
)

// DocsHandler handles documentation endpoints
type DocsHandler struct{}

// NewDocsHandler creates a new docs handler
func NewDocsHandler() *DocsHandler {
	return &DocsHandler{}
}

// SwaggerResponse represents the swagger documentation response
type SwaggerResponse struct {
	OpenAPI    string                 `json:"openapi" yaml:"openapi"`
	Info       map[string]interface{} `json:"info" yaml:"info"`
	Servers    []map[string]string    `json:"servers" yaml:"servers"`
	Tags       []map[string]string    `json:"tags" yaml:"tags"`
	Paths      map[string]interface{} `json:"paths" yaml:"paths"`
	Components map[string]interface{} `json:"components" yaml:"components"`
}

// GetSwaggerJSON exports swagger documentation as JSON
func (h *DocsHandler) GetSwaggerJSON(c *gin.Context) {
	swaggerData, err := h.loadSwaggerData()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   fmt.Sprintf(ErrLoadingSwagger, err),
		})
		return
	}

	c.Header(HeaderContentType, ContentTypeJSON)
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "Content-Type")

	// Return the swagger data directly, not wrapped in a response structure
	c.JSON(http.StatusOK, swaggerData)
}

// GetSwaggerYAML exports swagger documentation as YAML
func (h *DocsHandler) GetSwaggerYAML(c *gin.Context) {
	swaggerData, err := h.loadSwaggerData()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   fmt.Sprintf(ErrLoadingSwagger, err),
		})
		return
	}

	yamlData, err := yaml.Marshal(swaggerData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   fmt.Sprintf("Error converting to YAML: %v", err),
		})
		return
	}

	c.Header(HeaderContentType, ContentTypeYAML)
	c.Header("Content-Disposition", "attachment; filename=swagger.yaml")

	c.Data(http.StatusOK, ContentTypeYAML, yamlData)
}

// GetSwaggerUI serves the swagger UI interface
func (h *DocsHandler) GetSwaggerUI(c *gin.Context) {
	swaggerData, err := h.loadSwaggerData()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   fmt.Sprintf(ErrLoadingSwagger, err),
		})
		return
	}

	// Simple HTML response with Swagger UI
	html := h.generateSwaggerUIHTML(swaggerData)

	c.Header(HeaderContentType, ContentTypeHTML)
	c.String(http.StatusOK, html)
}

// GetDocsInfo returns information about available documentation formats
func (h *DocsHandler) GetDocsInfo(c *gin.Context) {
	baseURL := fmt.Sprintf("%s://%s", getScheme(c), c.Request.Host)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"title":       "Sistema de Expedientes Militares API Documentation",
			"version":     "1.0.0",
			"description": "Documentación de la API REST para el sistema de gestión de expedientes militares",
			"formats": gin.H{
				"json": gin.H{
					"url":          fmt.Sprintf("%s/api/v1/docs/swagger.json", baseURL),
					"description":  "Documentación en formato JSON",
					"content_type": ContentTypeJSON,
				},
				"yaml": gin.H{
					"url":          fmt.Sprintf("%s/api/v1/docs/swagger.yaml", baseURL),
					"description":  "Documentación en formato YAML",
					"content_type": ContentTypeYAML,
				},
				"ui": gin.H{
					"url":          fmt.Sprintf("%s/api/v1/docs/", baseURL),
					"description":  "Interfaz web interactiva Swagger UI",
					"content_type": ContentTypeHTML,
				},
			},
			"endpoints": []string{
				"GET /api/v1/docs/",
				"GET /api/v1/docs/info",
				"GET /api/v1/docs/swagger.json",
				"GET /api/v1/docs/swagger.yaml",
			},
			"generated_at": getCurrentTimestamp(),
		},
	})
}

// loadSwaggerData loads the swagger documentation from the YAML file
func (h *DocsHandler) loadSwaggerData() (map[string]interface{}, error) {
	// Try multiple possible paths for the swagger file
	possiblePaths := []string{
		"docs/swagger.yaml",
		"../docs/swagger.yaml",
		"./docs/swagger.yaml",
		"backend/docs/swagger.yaml",
	}

	var data []byte
	var err error
	var swaggerPath string

	for _, path := range possiblePaths {
		data, err = os.ReadFile(path)
		if err == nil {
			swaggerPath = path
			break
		}
	}

	if err != nil {
		return nil, fmt.Errorf("failed to read swagger file from any of the expected locations: %v", err)
	}

	var swaggerData map[string]interface{}
	err = yaml.Unmarshal(data, &swaggerData)
	if err != nil {
		return nil, fmt.Errorf("failed to parse swagger YAML from %s: %v", swaggerPath, err)
	}

	// Convert yaml interface{} keys to string keys for JSON compatibility
	swaggerData = h.convertYamlToJson(swaggerData)

	return swaggerData, nil
}

// generateSwaggerUIHTML generates a simple Swagger UI HTML page
func (h *DocsHandler) generateSwaggerUIHTML(swaggerData map[string]interface{}) string {
	title := "Sistema de Expedientes Militares API"
	if info, ok := swaggerData["info"].(map[string]interface{}); ok {
		if titleVal, ok := info["title"].(string); ok {
			title = titleVal
		}
	}

	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s - API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/v1/docs/swagger.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`, title)
}

// convertYamlToJson converts YAML interface{} keys to string keys for JSON compatibility
func (h *DocsHandler) convertYamlToJson(data interface{}) map[string]interface{} {
	switch v := data.(type) {
	case map[interface{}]interface{}:
		result := make(map[string]interface{})
		for key, value := range v {
			strKey := fmt.Sprintf("%v", key)
			result[strKey] = h.convertYamlToJsonValue(value)
		}
		return result
	case map[string]interface{}:
		result := make(map[string]interface{})
		for key, value := range v {
			result[key] = h.convertYamlToJsonValue(value)
		}
		return result
	default:
		// If it's not a map, wrap it in a map
		return map[string]interface{}{"data": h.convertYamlToJsonValue(data)}
	}
}

// convertYamlToJsonValue converts any YAML value to JSON-compatible value
func (h *DocsHandler) convertYamlToJsonValue(data interface{}) interface{} {
	switch v := data.(type) {
	case map[interface{}]interface{}:
		result := make(map[string]interface{})
		for key, value := range v {
			strKey := fmt.Sprintf("%v", key)
			result[strKey] = h.convertYamlToJsonValue(value)
		}
		return result
	case map[string]interface{}:
		result := make(map[string]interface{})
		for key, value := range v {
			result[key] = h.convertYamlToJsonValue(value)
		}
		return result
	case []interface{}:
		result := make([]interface{}, len(v))
		for i, value := range v {
			result[i] = h.convertYamlToJsonValue(value)
		}
		return result
	default:
		return v
	}
}

// Helper functions
func getCurrentTimestamp() string {
	return time.Now().UTC().Format(time.RFC3339)
}

func getScheme(c *gin.Context) string {
	if c.Request.TLS != nil {
		return "https"
	}
	return "http"
}
