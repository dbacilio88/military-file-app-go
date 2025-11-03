package middleware

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// RateLimiter represents a rate limiter for clients
type RateLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// RateLimitStorage stores rate limiters for different clients
type RateLimitStorage struct {
	clients map[string]*RateLimiter
	mu      sync.RWMutex
}

// NewRateLimitStorage creates a new rate limit storage
func NewRateLimitStorage() *RateLimitStorage {
	storage := &RateLimitStorage{
		clients: make(map[string]*RateLimiter),
	}

	// Clean up old entries every hour
	go storage.cleanupOldEntries()

	return storage
}

// GetLimiter returns a rate limiter for the given key
func (rs *RateLimitStorage) GetLimiter(key string, requestsPerHour int) *rate.Limiter {
	rs.mu.Lock()
	defer rs.mu.Unlock()

	limiter, exists := rs.clients[key]
	if !exists {
		limiter = &RateLimiter{
			limiter:  rate.NewLimiter(rate.Every(time.Hour/time.Duration(requestsPerHour)), requestsPerHour),
			lastSeen: time.Now(),
		}
		rs.clients[key] = limiter
	}

	limiter.lastSeen = time.Now()
	return limiter.limiter
}

// cleanupOldEntries removes entries that haven't been seen for 24 hours
func (rs *RateLimitStorage) cleanupOldEntries() {
	for {
		time.Sleep(time.Hour)
		rs.mu.Lock()
		for key, limiter := range rs.clients {
			if time.Since(limiter.lastSeen) > 24*time.Hour {
				delete(rs.clients, key)
			}
		}
		rs.mu.Unlock()
	}
}

var rateLimitStorage = NewRateLimitStorage()

// RateLimit middleware implements rate limiting per IP
func RateLimit(requestsPerHour, windowSeconds int) gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		limiter := rateLimitStorage.GetLimiter(clientIP, requestsPerHour)

		if !limiter.Allow() {
			c.JSON(429, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "RATE_LIMIT_EXCEEDED",
					"message": "Rate limit exceeded. Too many requests.",
				},
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
