package downloader

import (
	"fmt"
	"os"
	"path/filepath"
)

func CommitFile(tempPath string, finalPath string, expectedHash string) error {
	if err := VerifyFileSHA1(tempPath, expectedHash); err != nil {
		os.Remove(tempPath)
		return fmt.Errorf("integrity check failed for %s: %w", tempPath, err)
	}

	destDir := filepath.Dir(finalPath)
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return fmt.Errorf("failed to create destination directory %s: %w", destDir, err)
	}

	if err := os.Rename(tempPath, finalPath); err != nil {
		return fmt.Errorf("failed to move validated file to %s: %w", finalPath, err)
	}

	return nil
}
