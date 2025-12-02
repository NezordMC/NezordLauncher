package downloader

import (
	"errors"
	"fmt"
	"sync"
	"testing"
	"time"
)

type MockTask struct {
	id         int
	shouldFail bool
	mu         *sync.Mutex
	counter    *int
}

func (m *MockTask) Execute() error {
	time.Sleep(10 * time.Millisecond)

	m.mu.Lock()
	*m.counter++
	m.mu.Unlock()

	if m.shouldFail {
		return errors.New("simulated task failure")
	}
	return nil
}

func (m *MockTask) Name() string {
	return fmt.Sprintf("Task-%d", m.id)
}

func TestWorkerPoolExecution(t *testing.T) {
	taskCount := 10
	concurrency := 3
	var processedCount int
	var mu sync.Mutex

	pool := NewWorkerPool(concurrency, taskCount)
	pool.Start()

	for i := 0; i < taskCount; i++ {
		pool.Submit(&MockTask{
			id:         i,
			shouldFail: false,
			mu:         &mu,
			counter:    &processedCount,
		})
	}

	pool.Wait()

	if processedCount != taskCount {
		t.Errorf("Expected %d processed tasks, got %d", taskCount, processedCount)
	}
}

func TestWorkerPoolErrorHandling(t *testing.T) {
	pool := NewWorkerPool(2, 5)
	pool.Start()

	var mu sync.Mutex
	var count int

	pool.Submit(&MockTask{id: 1, shouldFail: true, mu: &mu, counter: &count})
	pool.Submit(&MockTask{id: 2, shouldFail: false, mu: &mu, counter: &count})

	pool.Wait()

	errCount := 0
	for range pool.Errors() {
		errCount++
	}

	if errCount != 1 {
		t.Errorf("Expected 1 error, got %d", errCount)
	}
}
	