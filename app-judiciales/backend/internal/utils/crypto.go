package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash checks if a password matches its hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateUniqueCode generates a unique code with timestamp
func GenerateUniqueCode(prefix string) string {
	timestamp := time.Now().Format("2006")
	randomBytes := make([]byte, 3)
	rand.Read(randomBytes)
	randomHex := hex.EncodeToString(randomBytes)
	return fmt.Sprintf("%s-%s-%s", prefix, timestamp, randomHex)
}

// GenerateExpedienteNumber generates a unique expediente number
func GenerateExpedienteNumber() string {
	year := time.Now().Format("2006")
	randomBytes := make([]byte, 4)
	rand.Read(randomBytes)
	number := hex.EncodeToString(randomBytes)
	return fmt.Sprintf("EXP-%s-%s", year, number)
}

// Ptr returns a pointer to the given value
func Ptr[T any](v T) *T {
	return &v
}

// Contains checks if a slice contains a specific element
func Contains[T comparable](slice []T, element T) bool {
	for _, item := range slice {
		if item == element {
			return true
		}
	}
	return false
}

// GetPointerValue safely gets the value from a pointer
func GetPointerValue[T any](ptr *T, defaultValue T) T {
	if ptr == nil {
		return defaultValue
	}
	return *ptr
}
