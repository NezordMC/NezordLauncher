package downloader

import (
	"crypto/sha1"
	"encoding/hex"
	"os"
	"path/filepath"
	"testing"
)

func TestCommitFileSuccess(t *testing.T) {
	tempDir := t.TempDir()
	tempFile := filepath.Join(tempDir, "test_file.part")
	finalFile := filepath.Join(tempDir, "final_subdir", "test_file.jar")
	content := []byte("Valid Content")

	if err := os.WriteFile(tempFile, content, 0644); err != nil {
		t.Fatalf("Failed to create temp file: %v", err)
	}

	hasher := sha1.New()
	hasher.Write(content)
	validHash := hex.EncodeToString(hasher.Sum(nil))

	if err := CommitFile(tempFile, finalFile, validHash); err != nil {
		t.Fatalf("CommitFile failed: %v", err)
	}

	if _, err := os.Stat(finalFile); os.IsNotExist(err) {
		t.Errorf("Final file was not created at %s", finalFile)
	}

	if _, err := os.Stat(tempFile); !os.IsNotExist(err) {
		t.Errorf("Temp file should have been moved/removed")
	}
}

func TestCommitFileCorruption(t *testing.T) {
	tempDir := t.TempDir()
	tempFile := filepath.Join(tempDir, "corrupt_file.part")
	finalFile := filepath.Join(tempDir, "corrupt_file.jar")
	content := []byte("Corrupt Content")

	if err := os.WriteFile(tempFile, content, 0644); err != nil {
		t.Fatalf("Failed to create temp file: %v", err)
	}

	if err := CommitFile(tempFile, finalFile, "badhash123"); err == nil {
		t.Error("CommitFile should have failed due to hash mismatch")
	}

	if _, err := os.Stat(finalFile); !os.IsNotExist(err) {
		t.Error("Final file should not exist after failed verification")
	}

	if _, err := os.Stat(tempFile); !os.IsNotExist(err) {
		t.Error("Corrupt temp file should have been deleted")
	}
}
