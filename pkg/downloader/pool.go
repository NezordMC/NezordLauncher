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
	errDone    chan struct{}
}

func NewWorkerPool(workers int, bufferSize int) *WorkerPool {
	return &WorkerPool{
		tasks:    make(chan Task, bufferSize),
		errors:   make(chan error, bufferSize),
		workers:  workers,
		Progress: NewProgress(0),
		errDone:  make(chan struct{}),
	}
}

func (p *WorkerPool) Start(ctx context.Context) {
	for i := 0; i < p.workers; i++ {
		p.wg.Add(1)
		go p.worker(ctx)
	}

	go func() {
		defer close(p.errDone)
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
	<-p.errDone
}

func (p *WorkerPool) Submit(t Task) {
	p.tasks <- t
}

func (p *WorkerPool) Errors() []error {
	p.errorMutex.Lock()
	defer p.errorMutex.Unlock()
	result := make([]error, len(p.errorList))
	copy(result, p.errorList)
	return result
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
			if err := p.process(ctx, task, client); err != nil {
				select {
				case p.errors <- fmt.Errorf("failed to process %s: %w", filepath.Base(task.Path), err):
				case <-ctx.Done():
					return
				}
			}
		}
	}
}

func (p *WorkerPool) process(ctx context.Context, t Task, client *network.HttpClient) error {
	if t.URL == "" || t.Path == "" {
		return fmt.Errorf("invalid task")
	}

	if t.SHA1 != "" {
		if valid, _ := VerifyFileSHA1(t.Path, t.SHA1); valid {
			p.Progress.Increment(0)
			return nil
		}
		if _, err := os.Stat(t.Path); err == nil {
			_ = os.Remove(t.Path)
		}
	} else {
		if _, err := os.Stat(t.Path); err == nil {
			p.Progress.Increment(0)
			return nil
		}
	}

	if err := os.MkdirAll(filepath.Dir(t.Path), 0755); err != nil {
		return err
	}

	partPath := t.Path + ".part"

	n, err := downloadWithResume(ctx, client, t.URL, partPath)
	if err != nil {
		return err
	}

	if err := CommitFile(partPath, t.Path, t.SHA1); err != nil {
		return err
	}

	p.Progress.Increment(n)
	return nil
}
