// Package storage provides ClickHouse storage for events.
package storage

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"

	"github.com/ai-traffic-analyzer/collector/internal/config"
	"github.com/ai-traffic-analyzer/collector/internal/models"
)

// createTableSQL is the DDL for the events table.
const createTableSQL = `
CREATE TABLE IF NOT EXISTS ai_traffic_events (
  ts DateTime64(3),
  received_at DateTime64(3),

  version UInt8,
  event_type String,

  request_id UUID,
  nonce String,
  key_id String,
  project_id String,

  method String,
  pathname String,
  route String,

  ip String,
  user_agent String,
  referer String,

  is_ai UInt8,
  ai_vendor String,
  bot_name String,
  intent String,
  confidence String
)
ENGINE = MergeTree
PARTITION BY toDate(ts)
ORDER BY (project_id, route, ts)
`

// createRoutePricesTableSQL is the DDL for the route prices table.
const createRoutePricesTableSQL = `
CREATE TABLE IF NOT EXISTS route_prices (
  route String,
  price_per_1k Float64,
  updated_at DateTime64(3)
)
ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (route)
`

// ClickHouseStore handles ClickHouse database operations.
type ClickHouseStore struct {
	conn driver.Conn
	cfg  *config.Config
}

// New creates a new ClickHouseStore and establishes connection.
func New(ctx context.Context, cfg *config.Config) (*ClickHouseStore, error) {
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{cfg.ClickHouseAddr()},
		Auth: clickhouse.Auth{
			Database: cfg.ClickHouseDB,
			Username: cfg.ClickHouseUser,
			Password: cfg.ClickHousePassword,
		},
		Settings: clickhouse.Settings{
			"max_execution_time": 60,
		},
		DialTimeout:     30 * time.Second,
		MaxOpenConns:    10,
		MaxIdleConns:    5,
		ConnMaxLifetime: time.Hour,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to open ClickHouse connection: %w", err)
	}

	// Test connection
	if err := conn.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping ClickHouse: %w", err)
	}

	store := &ClickHouseStore{
		conn: conn,
		cfg:  cfg,
	}

	return store, nil
}

// EnsureSchema creates the required tables if they don't exist.
func (s *ClickHouseStore) EnsureSchema(ctx context.Context) error {
	if err := s.conn.Exec(ctx, createTableSQL); err != nil {
		return fmt.Errorf("failed to create events table: %w", err)
	}
	if err := s.conn.Exec(ctx, createRoutePricesTableSQL); err != nil {
		return fmt.Errorf("failed to create route_prices table: %w", err)
	}
	log.Println("INFO: ClickHouse schema ensured")
	return nil
}

// InsertBatch inserts a batch of enriched events into ClickHouse.
func (s *ClickHouseStore) InsertBatch(ctx context.Context, events []models.EnrichedEvent) error {
	if len(events) == 0 {
		return nil
	}

	batch, err := s.conn.PrepareBatch(ctx, `
		INSERT INTO ai_traffic_events (
			ts, received_at,
			version, event_type,
			request_id, nonce, key_id, project_id,
			method, pathname, route,
			ip, user_agent, referer,
			is_ai, ai_vendor, bot_name, intent, confidence
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to prepare batch: %w", err)
	}

	for _, e := range events {
		isAI := uint8(0)
		if e.IsAI {
			isAI = 1
		}

		err := batch.Append(
			e.Timestamp,
			e.ReceivedAt,
			e.Version,
			e.EventType,
			e.RequestID,
			e.Nonce,
			e.KeyID,
			e.ProjectID,
			e.Method,
			e.Pathname,
			e.Route,
			e.IP,
			e.UserAgent,
			e.Referer,
			isAI,
			e.AIVendor,
			e.BotName,
			e.Intent,
			e.Confidence,
		)
		if err != nil {
			return fmt.Errorf("failed to append to batch: %w", err)
		}
	}

	if err := batch.Send(); err != nil {
		return fmt.Errorf("failed to send batch: %w", err)
	}

	return nil
}

// Close closes the ClickHouse connection.
func (s *ClickHouseStore) Close() error {
	return s.conn.Close()
}

// Ping checks if ClickHouse is reachable.
func (s *ClickHouseStore) Ping(ctx context.Context) error {
	return s.conn.Ping(ctx)
}

// GetOverview returns total and AI request counts for the given time range.
func (s *ClickHouseStore) GetOverview(ctx context.Context, filter models.AnalyticsFilter) (*models.OverviewResponse, error) {
	query := `
		SELECT 
			count() as total_requests,
			countIf(is_ai = 1) as ai_requests
		FROM ai_traffic_events
		WHERE ts >= ? AND ts <= ?
	`
	args := []interface{}{filter.From, filter.To}

	if filter.Route != "" {
		query += " AND route = ?"
		args = append(args, filter.Route)
	}

	var total, ai uint64
	row := s.conn.QueryRow(ctx, query, args...)
	if err := row.Scan(&total, &ai); err != nil {
		return nil, fmt.Errorf("failed to query overview: %w", err)
	}

	var aiShare float64
	if total > 0 {
		aiShare = float64(ai) / float64(total)
	}

	return &models.OverviewResponse{
		TotalRequests: total,
		AIRequests:    ai,
		AIShare:       aiShare,
	}, nil
}

// GetTimeseries returns time-bucketed request counts.
func (s *ClickHouseStore) GetTimeseries(ctx context.Context, filter models.AnalyticsFilter) ([]models.TimeseriesPoint, error) {
	var truncFunc string
	switch filter.Bucket {
	case "day":
		truncFunc = "toStartOfDay(ts)"
	default:
		truncFunc = "toStartOfHour(ts)"
	}

	query := fmt.Sprintf(`
		SELECT 
			%s as bucket,
			count() as total,
			countIf(is_ai = 1) as ai
		FROM ai_traffic_events
		WHERE ts >= ? AND ts <= ?
	`, truncFunc)
	args := []interface{}{filter.From, filter.To}

	if filter.Route != "" {
		query += " AND route = ?"
		args = append(args, filter.Route)
	}
	if filter.AIOnly {
		query += " AND is_ai = 1"
	}

	query += " GROUP BY bucket ORDER BY bucket ASC"

	if filter.Limit > 0 {
		query += fmt.Sprintf(" LIMIT %d", filter.Limit)
	}

	rows, err := s.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query timeseries: %w", err)
	}
	defer rows.Close()

	var result []models.TimeseriesPoint
	for rows.Next() {
		var bucket time.Time
		var total, ai uint64
		if err := rows.Scan(&bucket, &total, &ai); err != nil {
			return nil, fmt.Errorf("failed to scan timeseries row: %w", err)
		}
		result = append(result, models.TimeseriesPoint{
			Timestamp: bucket.UTC().Format(time.RFC3339),
			Total:     total,
			AI:        ai,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("timeseries rows error: %w", err)
	}

	return result, nil
}

// GetTopBots returns the top AI bots by request count.
func (s *ClickHouseStore) GetTopBots(ctx context.Context, filter models.AnalyticsFilter) ([]models.TopBot, error) {
	query := `
		SELECT 
			ai_vendor,
			bot_name,
			count() as requests
		FROM ai_traffic_events
		WHERE ts >= ? AND ts <= ? AND is_ai = 1
	`
	args := []interface{}{filter.From, filter.To}

	if filter.Route != "" {
		query += " AND route = ?"
		args = append(args, filter.Route)
	}

	query += " GROUP BY ai_vendor, bot_name ORDER BY requests DESC"

	limit := filter.Limit
	if limit <= 0 {
		limit = 10
	}
	query += fmt.Sprintf(" LIMIT %d", limit)

	rows, err := s.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query top bots: %w", err)
	}
	defer rows.Close()

	var result []models.TopBot
	for rows.Next() {
		var vendor, botName string
		var requests uint64
		if err := rows.Scan(&vendor, &botName, &requests); err != nil {
			return nil, fmt.Errorf("failed to scan top bots row: %w", err)
		}
		result = append(result, models.TopBot{
			AIOperator: vendor,
			AIBot:      botName,
			Requests:   requests,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("top bots rows error: %w", err)
	}

	return result, nil
}

// GetTopRoutes returns the top routes by AI request count.
func (s *ClickHouseStore) GetTopRoutes(ctx context.Context, filter models.AnalyticsFilter) ([]models.TopRoute, error) {
	query := `
		SELECT 
			route,
			count() as ai_requests
		FROM ai_traffic_events
		WHERE ts >= ? AND ts <= ? AND is_ai = 1
	`
	args := []interface{}{filter.From, filter.To}

	query += " GROUP BY route ORDER BY ai_requests DESC"

	limit := filter.Limit
	if limit <= 0 {
		limit = 10
	}
	query += fmt.Sprintf(" LIMIT %d", limit)

	rows, err := s.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query top routes: %w", err)
	}
	defer rows.Close()

	var result []models.TopRoute
	for rows.Next() {
		var route string
		var aiRequests uint64
		if err := rows.Scan(&route, &aiRequests); err != nil {
			return nil, fmt.Errorf("failed to scan top routes row: %w", err)
		}
		result = append(result, models.TopRoute{
			Route:      route,
			AIRequests: aiRequests,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("top routes rows error: %w", err)
	}

	return result, nil
}

// GetOpportunityData returns AI request counts for opportunity estimation.
func (s *ClickHouseStore) GetOpportunityData(ctx context.Context, from, to time.Time, routes []string, aiClasses []string) (uint64, error) {
	query := `
		SELECT count() as ai_requests
		FROM ai_traffic_events
		WHERE ts >= ? AND ts <= ? AND is_ai = 1
	`
	args := []interface{}{from, to}

	if len(routes) > 0 {
		query += " AND route IN (?)"
		args = append(args, routes)
	}

	if len(aiClasses) > 0 {
		query += " AND intent IN (?)"
		args = append(args, aiClasses)
	}

	var aiRequests uint64
	row := s.conn.QueryRow(ctx, query, args...)
	if err := row.Scan(&aiRequests); err != nil {
		return 0, fmt.Errorf("failed to query opportunity data: %w", err)
	}

	return aiRequests, nil
}

// GetOpportunityDataByRoute returns AI request counts grouped by route.
func (s *ClickHouseStore) GetOpportunityDataByRoute(ctx context.Context, from, to time.Time, routes []string, aiClasses []string) (map[string]uint64, error) {
	query := `
		SELECT route, count() as ai_requests
		FROM ai_traffic_events
		WHERE ts >= ? AND ts <= ? AND is_ai = 1
	`
	args := []interface{}{from, to}

	if len(routes) > 0 {
		query += " AND route IN (?)"
		args = append(args, routes)
	}

	if len(aiClasses) > 0 {
		query += " AND intent IN (?)"
		args = append(args, aiClasses)
	}

	query += " GROUP BY route ORDER BY ai_requests DESC"

	rows, err := s.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query opportunity data by route: %w", err)
	}
	defer rows.Close()

	result := make(map[string]uint64)
	for rows.Next() {
		var route string
		var count uint64
		if err := rows.Scan(&route, &count); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		result[route] = count
	}

	return result, nil
}

// GetAllRoutePrices returns all saved route prices.
func (s *ClickHouseStore) GetAllRoutePrices(ctx context.Context) (map[string]float64, error) {
	query := `
		SELECT route, price_per_1k
		FROM route_prices
		FINAL
		ORDER BY route
	`

	rows, err := s.conn.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query route prices: %w", err)
	}
	defer rows.Close()

	result := make(map[string]float64)
	for rows.Next() {
		var route string
		var price float64
		if err := rows.Scan(&route, &price); err != nil {
			return nil, fmt.Errorf("failed to scan route price row: %w", err)
		}
		result[route] = price
	}

	return result, nil
}

// SaveRoutePrices saves or updates route prices.
func (s *ClickHouseStore) SaveRoutePrices(ctx context.Context, prices map[string]float64) error {
	if len(prices) == 0 {
		return nil
	}

	batch, err := s.conn.PrepareBatch(ctx, `
		INSERT INTO route_prices (route, price_per_1k, updated_at)
	`)
	if err != nil {
		return fmt.Errorf("failed to prepare route prices batch: %w", err)
	}

	now := time.Now().UTC()
	for route, price := range prices {
		if err := batch.Append(route, price, now); err != nil {
			return fmt.Errorf("failed to append route price: %w", err)
		}
	}

	if err := batch.Send(); err != nil {
		return fmt.Errorf("failed to send route prices batch: %w", err)
	}

	return nil
}
