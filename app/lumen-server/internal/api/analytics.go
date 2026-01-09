package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/lumen-org/lumen/app/lumen-server/internal/models"
)

// Overview handles GET /v1/overview requests.
func (h *Handler) Overview(w http.ResponseWriter, r *http.Request) {
	filter, err := parseAnalyticsFilter(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "invalid_params", err.Error(), "")
		return
	}

	result, err := h.store.GetOverview(r.Context(), filter)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "query_error", "Failed to fetch overview", err.Error())
		return
	}

	// Calculate estimated revenue using saved route prices (with fallback to default)
	if result.AIRequests > 0 {
		// Fetch saved route prices
		savedPrices, err := h.store.GetAllRoutePrices(r.Context())
		if err != nil {
			// Log error but continue with default pricing
			savedPrices = make(map[string]float64)
		}

		// Get top routes for the same time period to calculate weighted revenue
		topRoutesFilter := filter
		topRoutesFilter.Limit = 10000 // Get all routes for accurate calculation
		topRoutes, err := h.store.GetTopRoutes(r.Context(), topRoutesFilter)

		var baseRevenue float64
		if err == nil && len(topRoutes) > 0 && len(savedPrices) > 0 {
			// Calculate revenue per-route using saved prices
			for _, route := range topRoutes {
				price, hasSavedPrice := savedPrices[route.Route]
				if !hasSavedPrice {
					price = h.defaultPricePer1K
				}
				chargeableForRoute := float64(route.AIRequests) * h.defaultPayThrough
				baseRevenue += chargeableForRoute / 1000.0 * price
			}
		} else {
			// Fall back to default pricing for all requests
			chargeableRequests := float64(result.AIRequests) * h.defaultPayThrough
			baseRevenue = chargeableRequests / 1000.0 * h.defaultPricePer1K
		}

		if baseRevenue > 0 {
			result.EstimatedRevenue = &models.RevenueEstimate{
				Low:  baseRevenue * 0.7,
				Mid:  baseRevenue,
				High: baseRevenue * 1.3,
			}
		}
	}

	WriteJSON(w, http.StatusOK, result)
}

// Timeseries handles GET /v1/timeseries requests.
func (h *Handler) Timeseries(w http.ResponseWriter, r *http.Request) {
	filter, err := parseAnalyticsFilter(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "invalid_params", err.Error(), "")
		return
	}

	// Parse bucket parameter
	bucket := r.URL.Query().Get("bucket")
	if bucket == "" {
		bucket = "hour"
	}
	if bucket != "hour" && bucket != "day" {
		WriteError(w, http.StatusBadRequest, "invalid_params", "bucket must be 'hour' or 'day'", "")
		return
	}
	filter.Bucket = bucket

	result, err := h.store.GetTimeseries(r.Context(), filter)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "query_error", "Failed to fetch timeseries", err.Error())
		return
	}

	// Return empty array instead of null
	if result == nil {
		result = []models.TimeseriesPoint{}
	}

	WriteJSON(w, http.StatusOK, result)
}

// TopBots handles GET /v1/top-bots requests.
func (h *Handler) TopBots(w http.ResponseWriter, r *http.Request) {
	filter, err := parseAnalyticsFilter(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "invalid_params", err.Error(), "")
		return
	}

	result, err := h.store.GetTopBots(r.Context(), filter)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "query_error", "Failed to fetch top bots", err.Error())
		return
	}

	// Return empty array instead of null
	if result == nil {
		result = []models.TopBot{}
	}

	WriteJSON(w, http.StatusOK, result)
}

// TopRoutes handles GET /v1/top-routes requests.
func (h *Handler) TopRoutes(w http.ResponseWriter, r *http.Request) {
	filter, err := parseAnalyticsFilter(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "invalid_params", err.Error(), "")
		return
	}

	result, err := h.store.GetTopRoutes(r.Context(), filter)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "query_error", "Failed to fetch top routes", err.Error())
		return
	}

	// Return empty array instead of null
	if result == nil {
		result = []models.TopRoute{}
	}

	WriteJSON(w, http.StatusOK, result)
}

// OpportunityEstimate handles POST /v1/opportunity/estimate requests.
func (h *Handler) OpportunityEstimate(w http.ResponseWriter, r *http.Request) {
	var req models.OpportunityEstimateRequest
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "invalid_json", "Failed to parse JSON body", err.Error())
		return
	}

	// Parse time range
	var from, to time.Time
	var err error
	now := time.Now().UTC()

	if req.From != "" {
		from, err = time.Parse(time.RFC3339, req.From)
		if err != nil {
			WriteError(w, http.StatusBadRequest, "invalid_params", "Invalid 'from' timestamp format", "Expected RFC3339")
			return
		}
	} else {
		from = now.Add(-24 * time.Hour)
	}

	if req.To != "" {
		to, err = time.Parse(time.RFC3339, req.To)
		if err != nil {
			WriteError(w, http.StatusBadRequest, "invalid_params", "Invalid 'to' timestamp format", "Expected RFC3339")
			return
		}
	} else {
		to = now
	}

	// Validate time range
	if from.After(now) {
		WriteError(w, http.StatusBadRequest, "invalid_params", "'from' cannot be in the future", "")
		return
	}

	if to.After(now) {
		WriteError(w, http.StatusBadRequest, "invalid_params", "'to' cannot be in the future", "")
		return
	}

	if from.After(to) {
		WriteError(w, http.StatusBadRequest, "invalid_params", "'from' must be before 'to'", "")
		return
	}

	// Maximum range: 90 days
	maxRange := 90 * 24 * time.Hour
	if to.Sub(from) > maxRange {
		WriteError(w, http.StatusBadRequest, "invalid_params", "Time range cannot exceed 90 days", "")
		return
	}

	// Validate pricing: need either price_per_1k or route_prices
	hasRoutePrices := len(req.RoutePrices) > 0
	hasFlatPrice := req.PricePer1K > 0

	if !hasRoutePrices && !hasFlatPrice {
		WriteError(w, http.StatusBadRequest, "invalid_params", "Either price_per_1k or route_prices must be provided", "")
		return
	}

	// Default pay_through to 100% if not specified or invalid
	payThrough := req.PayThrough
	if payThrough <= 0 || payThrough > 1 {
		payThrough = 1.0
	}

	var response models.OpportunityEstimateResponse

	if hasRoutePrices {
		// Per-route pricing mode
		// Get routes to query (from route_prices keys, merged with req.Routes if any)
		routesToQuery := make([]string, 0, len(req.RoutePrices))
		for route := range req.RoutePrices {
			routesToQuery = append(routesToQuery, route)
		}

		// Get per-route AI counts
		routeCounts, err := h.store.GetOpportunityDataByRoute(r.Context(), from, to, routesToQuery, req.AIClasses)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "query_error", "Failed to fetch opportunity data", err.Error())
			return
		}

		// Calculate weighted revenue
		var totalAIRequests uint64
		var totalRevenue float64
		breakdown := make([]models.RouteRevenueBreakdown, 0, len(routeCounts))

		for route, count := range routeCounts {
			totalAIRequests += count
			pricePerK := req.RoutePrices[route]
			if pricePerK <= 0 {
				pricePerK = req.PricePer1K // Fallback to default price
			}
			// Use float throughout to avoid truncation with small counts
			chargeableFloat := float64(count) * payThrough
			revenueForRoute := chargeableFloat / 1000.0 * pricePerK

			totalRevenue += revenueForRoute
			breakdown = append(breakdown, models.RouteRevenueBreakdown{
				Route:      route,
				AIRequests: count,
				Revenue:    revenueForRoute,
			})
		}

		chargeableRequests := uint64(float64(totalAIRequests) * payThrough)

		response = models.OpportunityEstimateResponse{
			AIRequests:         totalAIRequests,
			ChargeableRequests: chargeableRequests,
			EstimatedRevenue: models.RevenueEstimate{
				Low:  totalRevenue * 0.7,
				Mid:  totalRevenue,
				High: totalRevenue * 1.3,
			},
			RouteBreakdown: breakdown,
		}
	} else {
		// Standard flat pricing mode
		aiRequests, err := h.store.GetOpportunityData(r.Context(), from, to, req.Routes, req.AIClasses)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "query_error", "Failed to fetch opportunity data", err.Error())
			return
		}

		chargeableRequests := uint64(float64(aiRequests) * payThrough)
		baseRevenue := float64(chargeableRequests) / 1000.0 * req.PricePer1K

		response = models.OpportunityEstimateResponse{
			AIRequests:         aiRequests,
			ChargeableRequests: chargeableRequests,
			EstimatedRevenue: models.RevenueEstimate{
				Low:  baseRevenue * 0.7,
				Mid:  baseRevenue,
				High: baseRevenue * 1.3,
			},
		}
	}

	// Save route prices to database for persistence
	if hasRoutePrices {
		if err := h.store.SaveRoutePrices(r.Context(), req.RoutePrices); err != nil {
			// Log error but don't fail the request
			// The estimate was successful, saving is a side effect
			_ = err
		}
	}

	WriteJSON(w, http.StatusOK, response)
}

// RoutePrices handles GET /v1/route-prices requests.
func (h *Handler) RoutePrices(w http.ResponseWriter, r *http.Request) {
	prices, err := h.store.GetAllRoutePrices(r.Context())
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "query_error", "Failed to fetch route prices", err.Error())
		return
	}

	// Return empty object instead of null
	if prices == nil {
		prices = make(map[string]float64)
	}

	WriteJSON(w, http.StatusOK, prices)
}

// parseAnalyticsFilter extracts common filter parameters from the request.
func parseAnalyticsFilter(r *http.Request) (models.AnalyticsFilter, error) {
	filter := models.AnalyticsFilter{
		Limit: 10, // Default limit
	}

	// Parse 'from' timestamp
	fromStr := r.URL.Query().Get("from")
	if fromStr != "" {
		from, err := time.Parse(time.RFC3339, fromStr)
		if err != nil {
			return filter, &parseError{field: "from", message: "Invalid timestamp format, expected RFC3339"}
		}
		filter.From = from
	} else {
		// Default to last 24 hours
		filter.From = time.Now().UTC().Add(-24 * time.Hour)
	}

	// Parse 'to' timestamp
	toStr := r.URL.Query().Get("to")
	if toStr != "" {
		to, err := time.Parse(time.RFC3339, toStr)
		if err != nil {
			return filter, &parseError{field: "to", message: "Invalid timestamp format, expected RFC3339"}
		}
		filter.To = to
	} else {
		// Default to now
		filter.To = time.Now().UTC()
	}

	// Parse optional route filter
	filter.Route = r.URL.Query().Get("route")

	// Parse ai_only filter
	aiOnlyStr := r.URL.Query().Get("ai_only")
	if aiOnlyStr != "" {
		filter.AIOnly = aiOnlyStr == "true" || aiOnlyStr == "1"
	}

	// Parse limit
	limitStr := r.URL.Query().Get("limit")
	if limitStr != "" {
		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit < 1 {
			return filter, &parseError{field: "limit", message: "Invalid limit value, must be a positive integer"}
		}
		if limit > 1000 {
			limit = 1000 // Cap at 1000
		}
		filter.Limit = limit
	}

	return filter, nil
}

// parseError represents a query parameter parsing error.
type parseError struct {
	field   string
	message string
}

func (e *parseError) Error() string {
	return e.message
}
