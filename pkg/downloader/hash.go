package downloader

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"strings"
)

func VerifyFileSHA1(filePath string, expectedHash string) error {
	if expectedHash == "" {
		return nil
	}

	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("failed to open file for verification: %w", err)
	}
	defer file.Close()

	hash := sha1.New()
	if _, err := io.Copy(hash, file); err != nil {
		return fmt.Errorf("failed to calculate file hash: %w", err)
	}

	calculatedHash := hex.EncodeToString(hash.Sum(nil))
	
	if !strings.EqualFold(calculatedHash, expectedHash) {
		return fmt.Errorf("hash mismatch: expected %s, got %s", expectedHash, calculatedHash)
	}

	return nil
}
