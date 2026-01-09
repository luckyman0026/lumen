package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"github.com/lumen-org/lumen/app/lumen-server/internal/api"
	"github.com/lumen-org/lumen/app/lumen-server/internal/buffer"
	"github.com/lumen-org/lumen/app/lumen-server/internal/classifier"
	"github.com/lumen-org/lumen/app/lumen-server/internal/config"
	"github.com/lumen-org/lumen/app/lumen-server/internal/ingest"
	"github.com/lumen-org/lumen/app/lumen-server/internal/models"
	"github.com/lumen-org/lumen/app/lumen-server/internal/storage"
)

const (
	maxBodySize = 5 * 1024 * 1024 // 5MB max body size
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("INFO: Starting Lumen Collector...")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("FATAL: Failed to load configuration: %v", err)
	}
	log.Printf("INFO: Configuration loaded successfully")

	// Create context for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize ClickHouse storage with retry
	var store *storage.ClickHouseStore
	for i := 0; i < 30; i++ {
		store, err = storage.New(ctx, cfg)
		if err == nil {
			break
		}
		log.Printf("WARN: Failed to connect to ClickHouse (attempt %d/30): %v", i+1, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("FATAL: Failed to connect to ClickHouse after 30 attempts: %v", err)
	}
	defer store.Close()
	log.Println("INFO: Connected to ClickHouse")

	// Ensure schema exists
	if err := store.EnsureSchema(ctx); err != nil {
		log.Fatalf("FATAL: Failed to ensure schema: %v", err)
	}

	// Create flush function for buffer
	flushFn := func(ctx context.Context, events []models.EnrichedEvent) error {
		return store.InsertBatch(ctx, events)
	}

	// Initialize event buffer
	eventBuffer := buffer.New(
		cfg.BufferSize,
		time.Duration(cfg.FlushInterval)*time.Second,
		flushFn,
	)
	eventBuffer.Start()
	defer eventBuffer.Stop()
	log.Println("INFO: Event buffer initialized")

	// Initialize classifier
	aiClassifier := classifier.New()

	// Initialize ingest service
	ingestService := ingest.NewService(aiClassifier, eventBuffer)

	// Initialize API handlers
	handler := api.NewHandler(ingestService, store, cfg.DefaultPricePer1K, cfg.DefaultPayThrough)

	// Initialize middleware
	middleware := api.NewMiddleware(cfg.IngestToken)

	// Setup router
	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.Recoverer)
	r.Use(middleware.Logging)
	r.Use(middleware.MaxBodySize(maxBodySize))
	r.Use(middleware.Auth)

	// Routes
	r.Get("/health", handler.HealthCheck)

	// Ingestion
	r.Post("/v1/events", handler.IngestEvents)

	// Analytics
	r.Get("/v1/overview", handler.Overview)
	r.Get("/v1/timeseries", handler.Timeseries)
	r.Get("/v1/top-bots", handler.TopBots)
	r.Get("/v1/top-routes", handler.TopRoutes)
	r.Get("/v1/route-prices", handler.RoutePrices)
	r.Post("/v1/opportunity/estimate", handler.OpportunityEstimate)

	// Create server
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.HTTPPort),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Printf("INFO: HTTP server listening on :%d", cfg.HTTPPort)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("FATAL: HTTP server error: %v", err)
		}
	}()

	// Wait for shutdown signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	log.Println("INFO: Shutdown signal received, starting graceful shutdown...")

	// Create shutdown context with timeout
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	// Shutdown HTTP server
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("ERROR: HTTP server shutdown error: %v", err)
	}

	// Buffer and store will be closed by deferred calls
	log.Println("INFO: Graceful shutdown completed")
}
