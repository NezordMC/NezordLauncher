package downloader

import (
	"crypto/sha1"
	"encoding/hex"
	"os"
	"testing"
)

func TestVerifyFileSHA1(t *testing.T) {
	content := []byte("Nezord Launcher Integrity Check")
	tmpfile, err := os.CreateTemp("", "hash_test")
	if err != nil {
		t.Fatalf("Failed to create temp file: %v", err)
	}
	defer os.Remove(tmpfile.Name())

	if _, err := tmpfile.Write(content); err != nil {
		t.Fatalf("Failed to write to temp file: %v", err)
	}
	if err := tmpfile.Close(); err != nil {
		t.Fatalf("Failed to close temp file: %v", err)
	}

	hasher := sha1.New()
	hasher.Write(content)
	validHash := hex.EncodeToString(hasher.Sum(nil))

	err = VerifyFileSHA1(tmpfile.Name(), validHash)
	if err != nil {
		t.Errorf("Verification failed for valid hash: %v", err)
	}

	err = VerifyFileSHA1(tmpfile.Name(), "badhash12345")
	if err == nil {
		t.Error("Verification should have failed for invalid hash, but it passed")
	} else {
		t.Logf("Correctly caught hash mismatch: %v", err)
	}

	err = VerifyFileSHA1("non_existent_file.txt", validHash)
	if err == nil {
		t.Error("Verification should have failed for missing file")
	}
}