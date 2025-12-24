package downloader

import (
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
