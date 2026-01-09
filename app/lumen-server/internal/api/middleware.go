// Package api provides HTTP handlers and middleware for the event collector.
package api

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/lumen-org/lumen/app/lumen-server/internal/models"
)

// Middleware provides HTTP middleware functions.
type Middleware struct {
	ingestToken string
}

// NewMiddleware creates a new Middleware instance.
func NewMiddleware(ingestToken string) *Middleware {
	return &Middleware{
		ingestToken: ingestToken,
	}
}

// Auth validates the X-API-Key header.
func (m *Middleware) Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip auth for health check endpoint
		if r.URL.Path == "/health" {
			next.ServeHTTP(w, r)
			return
		}

		apiKey := r.Header.Get("X-API-Key")
		if apiKey == "" {
			writeError(w, http.StatusUnauthorized, "missing_auth", "X-API-Key header is required", "")
			return
		}

		if apiKey != m.ingestToken {
			writeError(w, http.StatusUnauthorized, "invalid_token", "Invalid API key", "")
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Logging logs incoming requests.
func (m *Middleware) Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Wrap response writer to capture status code
		wrapped := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(wrapped, r)

		duration := time.Since(start)
		log.Printf("INFO: %s %s %d %v", r.Method, r.URL.Path, wrapped.statusCode, duration)
	})
}

// MaxBodySize limits the request body size.
func (m *Middleware) MaxBodySize(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
			next.ServeHTTP(w, r)
		})
	}
}

// responseWriter wraps http.ResponseWriter to capture the status code.
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// writeJSON writes a JSON response.
func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("ERROR: Failed to encode JSON response: %v", err)
	}
}

// writeError writes a JSON error response.
func writeError(w http.ResponseWriter, status int, code, message, details string) {
	resp := models.ErrorResponse{
		Error:   message,
		Code:    code,
		Details: details,
	}
	writeJSON(w, status, resp)
}

// WriteSuccess writes a successful response.
func WriteSuccess(w http.ResponseWriter) {
	writeJSON(w, http.StatusOK, models.APIResponse{OK: true})
}

// WriteError is a public wrapper for writeError.
func WriteError(w http.ResponseWriter, status int, code, message, details string) {
	writeError(w, status, code, message, details)
}

// WriteJSON is a public wrapper for writeJSON.
func WriteJSON(w http.ResponseWriter, status int, data interface{}) {
	writeJSON(w, status, data)
}
