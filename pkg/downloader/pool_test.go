package downloader

import (
	"bytes"
	"context"
	"crypto/sha1"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestWorkerPoolExecution(t *testing.T) {
	content := []byte("Nezord Downloader Test")
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write(content)
	}))
	defer server.Close()

	hasher := sha1.New()
	hasher.Write(content)
	hash := hex.EncodeToString(hasher.Sum(nil))

	tempDir := t.TempDir()
	dest := filepath.Join(tempDir, "file.jar")

	pool := NewWorkerPool(2, 2)
	pool.Progress.AddTotal(1)
	pool.Start(context.Background())
	pool.Submit(Task{URL: server.URL, Path: dest, SHA1: hash})
	pool.Wait()

	ok, err := VerifyFileSHA1(dest, hash)
	if err != nil || !ok {
		t.Fatalf("downloaded file hash mismatch: %v", err)
	}

	completed, _ := pool.Progress.GetCounts()
	if completed != 1 {
		t.Fatalf("expected 1 completed file, got %d", completed)
	}
}

func TestWorkerPoolResume(t *testing.T) {
	content := bytes.Repeat([]byte("a"), 64*1024)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeContent(w, r, "file.jar", time.Now(), bytes.NewReader(content))
	}))
	defer server.Close()

	hasher := sha1.New()
	hasher.Write(content)
	hash := hex.EncodeToString(hasher.Sum(nil))

	tempDir := t.TempDir()
	dest := filepath.Join(tempDir, "file.jar")
	part := dest + ".part"

	if err := os.WriteFile(part, content[:1024], 0644); err != nil {
		t.Fatalf("failed to write part file: %v", err)
	}

	pool := NewWorkerPool(2, 2)
	pool.Progress.AddTotal(1)
	pool.Start(context.Background())
	pool.Submit(Task{URL: server.URL, Path: dest, SHA1: hash})
	pool.Wait()

	ok, err := VerifyFileSHA1(dest, hash)
	if err != nil || !ok {
		t.Fatalf("resume file hash mismatch: %v", err)
	}

	if _, err := os.Stat(part); !os.IsNotExist(err) {
		t.Fatalf("part file should not exist after commit")
	}
}

func TestWorkerPoolErrorHandling(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.NotFound(w, r)
	}))
	defer server.Close()

	tempDir := t.TempDir()
	dest := filepath.Join(tempDir, "file.jar")

	pool := NewWorkerPool(1, 1)
	pool.Progress.AddTotal(1)
	pool.Start(context.Background())
	pool.Submit(Task{URL: server.URL, Path: dest})
	pool.Wait()

	if len(pool.Errors()) != 1 {
		t.Fatalf("expected 1 error, got %d", len(pool.Errors()))
	}
}
