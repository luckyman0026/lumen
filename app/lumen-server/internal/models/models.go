// Package models defines data structures for events and API responses.
package models

import (
	"time"

	"github.com/google/uuid"
)

// RawEvent represents an incoming event from the client SDK.
type RawEvent struct {
	Version   string `json:"version"`
	EventType string `json:"eventType"`
	RequestID string `json:"requestId"`
	Timestamp string `json:"timestamp"`
	Nonce     string `json:"nonce"`
	KeyID     string `json:"keyId"`
	Method    string `json:"method"`
	Pathname  string `json:"pathname"`
	IP        string `json:"ip"`
	UserAgent string `json:"userAgent"`
	Referer   string `json:"referer"`
}

// EventBatch represents a batch of events from the client.
type EventBatch struct {
	Events []RawEvent `json:"events"`
}

// EnrichedEvent represents a fully processed event ready for storage.
type EnrichedEvent struct {
	// Timestamps
	Timestamp  time.Time
	ReceivedAt time.Time

	// Event metadata
	Version   uint8
	EventType string
	RequestID uuid.UUID
	Nonce     string
	KeyID     string
	ProjectID string

	// Request details
	Method    string
	Pathname  string
	Route     string
	IP        string
	UserAgent string
	Referer   string

	// AI classification
	IsAI       bool
	AIVendor   string
	BotName    string
	Intent     string
	Confidence string
}

// APIResponse represents a standard API response.
type APIResponse struct {
	OK      bool   `json:"ok"`
	Message string `json:"message,omitempty"`
}

// ErrorResponse represents an error response.
type ErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}

// HealthResponse represents the health check response.
type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
}

// OverviewResponse represents the overview analytics response.
type OverviewResponse struct {
	TotalRequests    uint64           `json:"total_requests"`
	AIRequests       uint64           `json:"ai_requests"`
	AIShare          float64          `json:"ai_share"`
	EstimatedRevenue *RevenueEstimate `json:"estimated_revenue,omitempty"`
}

// TimeseriesPoint represents a single point in the timeseries.
type TimeseriesPoint struct {
	Timestamp string `json:"ts"`
	Total     uint64 `json:"total"`
	AI        uint64 `json:"ai"`
}

// TopBot represents a bot entry in the top-bots response.
type TopBot struct {
	AIOperator string `json:"ai_operator"`
	AIBot      string `json:"ai_bot"`
	Requests   uint64 `json:"requests"`
}

// TopRoute represents a route entry in the top-routes response.
type TopRoute struct {
	Route      string `json:"route"`
	AIRequests uint64 `json:"ai_requests"`
}

// OpportunityEstimateRequest represents the input for opportunity estimation.
type OpportunityEstimateRequest struct {
	From        string             `json:"from"`
	To          string             `json:"to"`
	Routes      []string           `json:"routes,omitempty"`
	PricePer1K  float64            `json:"price_per_1k"`
	PayThrough  float64            `json:"pay_through"`
	AIClasses   []string           `json:"ai_classes,omitempty"`
	RoutePrices map[string]float64 `json:"route_prices,omitempty"` // Per-route pricing (price per 1k)
}

// RevenueEstimate holds low/mid/high revenue estimates.
type RevenueEstimate struct {
	Low  float64 `json:"low"`
	Mid  float64 `json:"mid"`
	High float64 `json:"high"`
}

// OpportunityEstimateResponse represents the opportunity estimation result.
type OpportunityEstimateResponse struct {
	AIRequests         uint64                  `json:"ai_requests"`
	ChargeableRequests uint64                  `json:"chargeable_requests"`
	EstimatedRevenue   RevenueEstimate         `json:"estimated_revenue"`
	RouteBreakdown     []RouteRevenueBreakdown `json:"route_breakdown,omitempty"`
}

// RouteRevenueBreakdown shows revenue contribution per route.
type RouteRevenueBreakdown struct {
	Route      string  `json:"route"`
	AIRequests uint64  `json:"ai_requests"`
	Revenue    float64 `json:"revenue"`
}

// AnalyticsFilter holds common filter parameters for analytics queries.
type AnalyticsFilter struct {
	From   time.Time
	To     time.Time
	Route  string
	AIOnly bool
	Limit  int
	Bucket string // "hour" or "day"
}
