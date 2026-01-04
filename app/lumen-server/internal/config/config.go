// Package config provides configuration loading from environment variables.
package config

import (
	"fmt"
	"os"
	"strconv"
)

// Config holds all configuration values for the collector service.
type Config struct {
	// ClickHouse connection settings
	ClickHouseHost     string
	ClickHousePort     int
	ClickHouseDB       string
	ClickHouseUser     string
	ClickHousePassword string

	// API settings
	IngestToken string
	HTTPPort    int

	// Buffer settings
	BufferSize    int // Max events before flush
	FlushInterval int // Seconds between flushes

	// Pricing defaults for revenue estimation
	DefaultPricePer1K float64 // Default price per 1000 AI requests
	DefaultPayThrough float64 // Default percentage of AI traffic that pays (0.0-1.0)
}

// Load reads configuration from environment variables.
// Returns an error if required variables are missing.
func Load() (*Config, error) {
	cfg := &Config{
		ClickHouseHost:     getEnv("CLICKHOUSE_HOST", "clickhouse"),
		ClickHousePort:     getEnvInt("CLICKHOUSE_PORT", 9000),
		ClickHouseDB:       getEnv("CLICKHOUSE_DB", "default"),
		ClickHouseUser:     getEnv("CLICKHOUSE_USER", "default"),
		ClickHousePassword: getEnv("CLICKHOUSE_PASSWORD", ""),
		IngestToken:        getEnv("INGEST_TOKEN", ""),
		HTTPPort:           getEnvInt("HTTP_PORT", 8080),
		BufferSize:         getEnvInt("BUFFER_SIZE", 1000),
		FlushInterval:      getEnvInt("FLUSH_INTERVAL", 1),
		DefaultPricePer1K:  getEnvFloat("DEFAULT_PRICE_PER_1K", 0.50),
		DefaultPayThrough:  getEnvFloat("DEFAULT_PAY_THROUGH", 1.0),
	}

	// Validate required fields
	if cfg.IngestToken == "" {
		return nil, fmt.Errorf("INGEST_TOKEN environment variable is required")
	}

	return cfg, nil
}

// ClickHouseAddr returns the formatted ClickHouse address.
func (c *Config) ClickHouseAddr() string {
	return fmt.Sprintf("%s:%d", c.ClickHouseHost, c.ClickHousePort)
}

// getEnv retrieves an environment variable or returns a default value.
func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

// getEnvInt retrieves an environment variable as an integer or returns a default.
func getEnvInt(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			return i
		}
	}
	return defaultVal
}

// getEnvFloat retrieves an environment variable as a float64 or returns a default.
func getEnvFloat(key string, defaultVal float64) float64 {
	if val := os.Getenv(key); val != "" {
		if f, err := strconv.ParseFloat(val, 64); err == nil {
			return f
		}
	}
	return defaultVal
}
