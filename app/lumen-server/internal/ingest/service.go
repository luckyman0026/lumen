// Package ingest provides event ingestion and enrichment services.
package ingest

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"

	"github.com/lumen-org/lumen/app/lumen-server/internal/buffer"
	"github.com/lumen-org/lumen/app/lumen-server/internal/classifier"
	"github.com/lumen-org/lumen/app/lumen-server/internal/models"
)

// ValidationError represents an event validation error.
type ValidationError struct {
	Message string
	Details string
}

func (e *ValidationError) Error() string {
	return e.Message
}

// Service handles event ingestion and enrichment.
type Service struct {
	classifier *classifier.Classifier
	buffer     *buffer.Buffer
}

// NewService creates a new ingest Service.
func NewService(classifier *classifier.Classifier, buffer *buffer.Buffer) *Service {
	return &Service{
		classifier: classifier,
		buffer:     buffer,
	}
}

// ProcessBatch validates, enriches, and buffers a batch of events.
func (s *Service) ProcessBatch(ctx context.Context, rawEvents []models.RawEvent) error {
	enrichedEvents := make([]models.EnrichedEvent, 0, len(rawEvents))
	receivedAt := time.Now().UTC()

	for i, raw := range rawEvents {
		// Validate required fields
		if err := validateEvent(raw, i); err != nil {
			return err
		}

		// Parse timestamp
		ts, err := time.Parse(time.RFC3339, raw.Timestamp)
		if err != nil {
			return &ValidationError{
				Message: fmt.Sprintf("Invalid timestamp format at index %d", i),
				Details: fmt.Sprintf("Expected RFC3339 format, got: %s", raw.Timestamp),
			}
		}

		// Parse request ID as UUID
		requestID, err := uuid.Parse(raw.RequestID)
		if err != nil {
			return &ValidationError{
				Message: fmt.Sprintf("Invalid requestId format at index %d", i),
				Details: fmt.Sprintf("Expected UUID format, got: %s", raw.RequestID),
			}
		}

		// Parse version
		version, err := strconv.ParseUint(raw.Version, 10, 8)
		if err != nil {
			version = 1 // Default to version 1
		}

		// Classify the request
		classification := s.classifier.Classify(raw.UserAgent)

		// Create enriched event
		enriched := models.EnrichedEvent{
			Timestamp:  ts,
			ReceivedAt: receivedAt,
			Version:    uint8(version),
			EventType:  raw.EventType,
			RequestID:  requestID,
			Nonce:      raw.Nonce,
			KeyID:      raw.KeyID,
			ProjectID:  "default", // Default project for now
			Method:     raw.Method,
			Pathname:   raw.Pathname,
			Route:      raw.Pathname, // No normalization yet
			IP:         raw.IP,
			UserAgent:  raw.UserAgent,
			Referer:    raw.Referer,
			IsAI:       classification.IsAI,
			AIVendor:   classification.AIVendor,
			BotName:    classification.BotName,
			Intent:     classification.Intent,
			Confidence: classification.Confidence,
		}

		enrichedEvents = append(enrichedEvents, enriched)
	}

	// Add to buffer (buffer handles flushing to storage)
	s.buffer.Add(enrichedEvents)

	return nil
}

// validateEvent checks that required fields are present.
func validateEvent(event models.RawEvent, index int) *ValidationError {
	if event.RequestID == "" {
		return &ValidationError{
			Message: fmt.Sprintf("Missing required field 'requestId' at index %d", index),
			Details: "requestId is required for event tracking",
		}
	}

	if event.Timestamp == "" {
		return &ValidationError{
			Message: fmt.Sprintf("Missing required field 'timestamp' at index %d", index),
			Details: "timestamp is required in RFC3339 format",
		}
	}

	if event.EventType == "" {
		return &ValidationError{
			Message: fmt.Sprintf("Missing required field 'eventType' at index %d", index),
			Details: "eventType is required (e.g., 'request')",
		}
	}

	if event.Method == "" {
		return &ValidationError{
			Message: fmt.Sprintf("Missing required field 'method' at index %d", index),
			Details: "HTTP method is required (e.g., 'GET', 'POST')",
		}
	}

	if event.Pathname == "" {
		return &ValidationError{
			Message: fmt.Sprintf("Missing required field 'pathname' at index %d", index),
			Details: "pathname is required (e.g., '/api/test')",
		}
	}

	return nil
}
