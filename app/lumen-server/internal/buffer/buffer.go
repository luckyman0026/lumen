// Package buffer provides an in-memory event buffer with time and size-based flushing.
package buffer

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/lumen-org/lumen/app/lumen-server/internal/models"
)

// FlushFunc is called when the buffer needs to be flushed.
type FlushFunc func(ctx context.Context, events []models.EnrichedEvent) error

// Buffer manages event buffering with automatic flushing.
type Buffer struct {
	mu            sync.Mutex
	events        []models.EnrichedEvent
	maxSize       int
	flushInterval time.Duration
	flushFn       FlushFunc

	ctx    context.Context
	cancel context.CancelFunc
	wg     sync.WaitGroup

	// Channels for coordination
	flushCh chan struct{}
}

// New creates a new Buffer with the specified settings.
func New(maxSize int, flushInterval time.Duration, flushFn FlushFunc) *Buffer {
	ctx, cancel := context.WithCancel(context.Background())

	b := &Buffer{
		events:        make([]models.EnrichedEvent, 0, maxSize),
		maxSize:       maxSize,
		flushInterval: flushInterval,
		flushFn:       flushFn,
		ctx:           ctx,
		cancel:        cancel,
		flushCh:       make(chan struct{}, 1),
	}

	return b
}

// Start begins the background flush worker.
func (b *Buffer) Start() {
	b.wg.Add(1)
	go b.worker()
}

// Add adds events to the buffer.
// If the buffer reaches maxSize, it triggers a flush.
func (b *Buffer) Add(events []models.EnrichedEvent) {
	b.mu.Lock()
	b.events = append(b.events, events...)
	shouldFlush := len(b.events) >= b.maxSize
	b.mu.Unlock()

	if shouldFlush {
		// Signal flush without blocking
		select {
		case b.flushCh <- struct{}{}:
		default:
		}
	}
}

// worker runs the background flush loop.
func (b *Buffer) worker() {
	defer b.wg.Done()

	ticker := time.NewTicker(b.flushInterval)
	defer ticker.Stop()

	for {
		select {
		case <-b.ctx.Done():
			// Final flush on shutdown
			b.flush()
			return
		case <-ticker.C:
			b.flush()
		case <-b.flushCh:
			b.flush()
		}
	}
}

// flush sends buffered events to the storage layer.
func (b *Buffer) flush() {
	b.mu.Lock()
	if len(b.events) == 0 {
		b.mu.Unlock()
		return
	}

	// Swap out the events slice
	toFlush := b.events
	b.events = make([]models.EnrichedEvent, 0, b.maxSize)
	b.mu.Unlock()

	// Perform the flush
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := b.flushFn(ctx, toFlush); err != nil {
		log.Printf("ERROR: Failed to flush %d events: %v", len(toFlush), err)

		// Re-add failed events (with some limit to prevent memory issues)
		b.mu.Lock()
		if len(b.events)+len(toFlush) <= b.maxSize*2 {
			b.events = append(toFlush, b.events...)
		} else {
			log.Printf("WARN: Dropping %d events due to persistent flush failures", len(toFlush))
		}
		b.mu.Unlock()
	} else {
		log.Printf("INFO: Flushed %d events to storage", len(toFlush))
	}
}

// Stop gracefully stops the buffer, flushing any remaining events.
func (b *Buffer) Stop() {
	b.cancel()
	b.wg.Wait()
}

// Len returns the current number of buffered events.
func (b *Buffer) Len() int {
	b.mu.Lock()
	defer b.mu.Unlock()
	return len(b.events)
}
