package logging

import (
	"fmt"
	"os"
	"path/filepath"
)

func rotateLogs(dir, filename string, maxFiles int) {
	oldest := filepath.Join(dir, fmt.Sprintf("%s.%d", filename, maxFiles))
	if _, err := os.Stat(oldest); err == nil {
		_ = os.Remove(oldest)
	}

	for i := maxFiles - 1; i >= 1; i-- {
		oldPath := filepath.Join(dir, fmt.Sprintf("%s.%d", filename, i))
		newPath := filepath.Join(dir, fmt.Sprintf("%s.%d", filename, i+1))
		if _, err := os.Stat(oldPath); err == nil {
			_ = os.Rename(oldPath, newPath)
		}
	}

	current := filepath.Join(dir, filename)
	if _, err := os.Stat(current); err == nil {
		first := filepath.Join(dir, fmt.Sprintf("%s.1", filename))
		_ = os.Rename(current, first)
	}
}
