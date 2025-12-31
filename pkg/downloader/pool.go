package downloader

import (
	"NezordLauncher/pkg/network"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

type WorkerPool struct {
	tasks      chan Task
	workers    int
	wg         sync.WaitGroup
	errors     chan error
	errorList  []error
	errorMutex sync.Mutex
	Progress   *DownloadProgress
}

func NewWorkerPool(workers int, bufferSize int) *WorkerPool {
	return &WorkerPool{
		tasks:    make(chan Task, bufferSize),
		errors:   make(chan error, bufferSize),
		workers:  workers,
		Progress: NewProgress(0),
	}
}

func (p *WorkerPool) Start(ctx context.Context) {
	for i := 0; i < p.workers; i++ {
		p.wg.Add(1)
		go p.worker(ctx)
	}
	
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case err, ok := <-p.errors:
				if !ok {
					return
				}
				p.errorMutex.Lock()
				p.errorList = append(p.errorList, err)
				p.errorMutex.Unlock()
				fmt.Printf("[Downloader Error] %v\n", err)
			}
		}
	}()
}

func (p *WorkerPool) Wait() {
	close(p.tasks)
	p.wg.Wait()
	close(p.errors)
}

func (p *WorkerPool) Submit(t Task) {
	p.tasks <- t
}

func (p *WorkerPool) worker(ctx context.Context) {
	defer p.wg.Done()
	client := network.NewHttpClient()

	for {
		select {
		case <-ctx.Done():
			return
		case task, ok := <-p.tasks:
			if !ok {
				return
			}
			if err := p.process(task, client); err != nil {
				select {
				case p.errors <- fmt.Errorf("failed to process %s: %w", filepath.Base(task.Path), err):
				case <-ctx.Done():
					return
				}
			}
		}
	}
}

func (p *WorkerPool) process(t Task, client *network.HttpClient) error {
	if t.SHA1 != "" {
		if valid, _ := VerifyFileSHA1(t.Path, t.SHA1); valid {
			return nil 
		}
	} else {
		if _, err := os.Stat(t.Path); err == nil {
			return nil
		}
	}

	if err := os.MkdirAll(filepath.Dir(t.Path), 0755); err != nil {
		return err
	}

	data, err := client.Get(t.URL)
	if err != nil {
		return err
	}

	if err := os.WriteFile(t.Path, data, 0644); err != nil {
		return err
	}
	
	p.Progress.Increment(int64(len(data)))
	return nil
}
