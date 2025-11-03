package middleware

import (
"net/http"
"os"
"strings"
"time"

"github.com/gin-gonic/gin"
"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
UserID    string   `json:"user_id"`
Email     string   `json:"email"`
Roles     []string `json:"roles"`
ProfileID string   `json:"profile_id"`
jwt.RegisteredClaims
}

// AuthMiddleware validates JWT token
func AuthMiddleware() gin.HandlerFunc {
return func(c *gin.Context) {
secretKey := os.Getenv("JWT_SECRET")
if secretKey == "" {
secretKey = "default-secret-key-change-in-production"
}

authHeader := c.GetHeader("Authorization")
if authHeader == "" {
c.JSON(http.StatusUnauthorized, gin.H{
"success": false,
"error": gin.H{
"code":    "UNAUTHORIZED",
"message": "Encabezado de autorización requerido",
},
})
c.Abort()
return
}

// Extract token from "Bearer <token>"
tokenParts := strings.Split(authHeader, " ")
if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
c.JSON(http.StatusUnauthorized, gin.H{
"success": false,
"error": gin.H{
"code":    "INVALID_TOKEN_FORMAT",
"message": "Formato de encabezado de autorización inválido",
},
})
c.Abort()
return
}

tokenString := tokenParts[1]

// Parse and validate token
token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
return []byte(secretKey), nil
})

if err != nil {
c.JSON(http.StatusUnauthorized, gin.H{
"success": false,
"error": gin.H{
"code":    "INVALID_TOKEN",
"message": "Token inválido o expirado",
},
})
c.Abort()
return
}

if claims, ok := token.Claims.(*Claims); ok && token.Valid {
// Check if token is expired
if claims.ExpiresAt.Time.Before(time.Now()) {
c.JSON(http.StatusUnauthorized, gin.H{
"success": false,
"error": gin.H{
"code":    "TOKEN_EXPIRED",
"message": "El token ha expirado",
},
})
c.Abort()
return
}

// Set user info in context
c.Set("user_id", claims.UserID)
c.Set("user_email", claims.Email)
c.Set("user_roles", claims.Roles)
c.Set("user_profile_id", claims.ProfileID)
c.Next()
} else {
c.JSON(http.StatusUnauthorized, gin.H{
"success": false,
"error": gin.H{
"code":    "INVALID_CLAIMS",
"message": "Claims del token inválidos",
},
})
c.Abort()
return
}
}
}

// RequireRole middleware checks if user has required role
func RequireRole(roles ...string) gin.HandlerFunc {
return func(c *gin.Context) {
userRoles, exists := c.Get("user_roles")
if !exists {
c.JSON(http.StatusForbidden, gin.H{
"success": false,
"error": gin.H{
"code":    "ROLE_NOT_FOUND",
"message": "Rol de usuario no encontrado en el contexto",
},
})
c.Abort()
return
}

// userRoles is expected to be []string
roleSlice, _ := userRoles.([]string)
hasPermission := false
for _, required := range roles {
for _, r := range roleSlice {
if r == required {
hasPermission = true
break
}
}
if hasPermission {
break
}
}

if !hasPermission {
c.JSON(http.StatusForbidden, gin.H{
"success": false,
"error": gin.H{
"code":    "INSUFFICIENT_PERMISSIONS",
"message": "El usuario no tiene los permisos requeridos",
},
})
c.Abort()
return
}

c.Next()
}
}
