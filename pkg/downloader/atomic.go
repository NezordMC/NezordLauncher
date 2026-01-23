package downloader

import (
	"fmt"
	"os"
	"path/filepath"
)

func CheckFileSHA1(path string, expected string) bool {
	valid, _ := VerifyFileSHA1(path, expected)
	return valid
}

func AtomicWriteFile(path string, data []byte) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	tmpFile, err := os.CreateTemp(dir, "tmp-*")
	if err != nil {
		return err
	}
	defer os.Remove(tmpFile.Name())

	if _, err := tmpFile.Write(data); err != nil {
		tmpFile.Close()
		return err
	}
	if err := tmpFile.Close(); err != nil {
		return err
	}

	return os.Rename(tmpFile.Name(), path)
}

func CommitFile(tempPath, finalPath, expectedSHA1 string) error {
	if expectedSHA1 != "" {
		valid, err := VerifyFileSHA1(tempPath, expectedSHA1)
		if err != nil {
			_ = os.Remove(tempPath)
			return err
		}
		if !valid {
			_ = os.Remove(tempPath)
			return fmt.Errorf("sha1 mismatch")
		}
	}

	if err := os.MkdirAll(filepath.Dir(finalPath), 0755); err != nil {
		return err
	}

	if _, err := os.Stat(finalPath); err == nil {
		if err := os.Remove(finalPath); err != nil {
			return err
		}
	}

	return os.Rename(tempPath, finalPath)
}
