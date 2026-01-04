package api

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/ai-traffic-analyzer/collector/internal/ingest"
	"github.com/ai-traffic-analyzer/collector/internal/models"
	"github.com/ai-traffic-analyzer/collector/internal/storage"
)

const (
	maxBatchSize = 5000
	minBatchSize = 1
)

// Handler provides HTTP handlers for the API.
type Handler struct {
	ingestService     *ingest.Service
	store             *storage.ClickHouseStore
	defaultPricePer1K float64
	defaultPayThrough float64
}

// NewHandler creates a new Handler.
func NewHandler(ingestService *ingest.Service, store *storage.ClickHouseStore, defaultPricePer1K, defaultPayThrough float64) *Handler {
	return &Handler{
		ingestService:     ingestService,
		store:             store,
		defaultPricePer1K: defaultPricePer1K,
		defaultPayThrough: defaultPayThrough,
	}
}

// HealthCheck handles GET /health requests.
func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	status := "healthy"

	// Check ClickHouse connectivity
	if err := h.store.Ping(ctx); err != nil {
		status = "degraded"
	}

	resp := models.HealthResponse{
		Status:    status,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	WriteJSON(w, http.StatusOK, resp)
}

// IngestEvents handles POST /v1/events requests.
func (h *Handler) IngestEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "Only POST method is allowed", "")
		return
	}

	// Parse request body
	var batch models.EventBatch
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&batch); err != nil {
		WriteError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body", err.Error())
		return
	}

	// Validate batch size
	if len(batch.Events) < minBatchSize {
		WriteError(w, http.StatusBadRequest, "empty_batch", "At least one event is required", "")
		return
	}

	if len(batch.Events) > maxBatchSize {
		WriteError(w, http.StatusBadRequest, "batch_too_large", "Maximum batch size is 5000 events", "")
		return
	}

	// Validate and process events
	if err := h.ingestService.ProcessBatch(r.Context(), batch.Events); err != nil {
		if validationErr, ok := err.(*ingest.ValidationError); ok {
			WriteError(w, http.StatusBadRequest, "validation_error", validationErr.Error(), validationErr.Details)
			return
		}
		WriteError(w, http.StatusInternalServerError, "processing_error", "Failed to process events", err.Error())
		return
	}

	WriteSuccess(w)
}
