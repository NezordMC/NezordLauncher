package downloader

import (
	"fmt"
	"sync"
)

type Task interface {
	Execute() error
	Name() string
}

type WorkerPool struct {
	tasks       chan Task
	concurrency int
	wg          sync.WaitGroup
	errorChan   chan error
}

func NewWorkerPool(concurrency int, bufferSize int) *WorkerPool {
	return &WorkerPool{
		tasks:       make(chan Task, bufferSize),
		concurrency: concurrency,
		errorChan:   make(chan error, bufferSize),
	}
}

func (wp *WorkerPool) Start() {
	for i := 0; i < wp.concurrency; i++ {
		wp.wg.Add(1)
		go wp.worker(i)
	}
}

func (wp *WorkerPool) worker(id int) {
	defer wp.wg.Done()
	for task := range wp.tasks {
		if err := task.Execute(); err != nil {
			wp.errorChan <- fmt.Errorf("worker %d failed to execute task %s: %w", id, task.Name(), err)
		}
	}
}

func (wp *WorkerPool) Submit(task Task) {
	wp.tasks <- task
}

func (wp *WorkerPool) Wait() {
	close(wp.tasks)
	wp.wg.Wait()
	close(wp.errorChan)
}

func (wp *WorkerPool) Errors() <-chan error {
	return wp.errorChan
}
