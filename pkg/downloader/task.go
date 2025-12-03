package downloader

import (
	"fmt"
	"NezordLauncher/pkg/network"
	"os"
	"path/filepath"
)

type DownloadTask struct {
	URL         string
	Destination string
	SHA1        string
	NameID      string
	Client      *network.HttpClient
}

func (t *DownloadTask) Execute() error {
	if err := t.ensureDir(); err != nil {
		return err
	}

	if t.isAlreadyValid() {
		return nil
	}

	tempFile := t.Destination + ".part"
	
	data, err := t.Client.Get(t.URL)
	if err != nil {
		return fmt.Errorf("failed to download %s: %w", t.NameID, err)
	}

	if err := os.WriteFile(tempFile, data, 0644); err != nil {
		return fmt.Errorf("failed to write temp file for %s: %w", t.NameID, err)
	}

	if err := CommitFile(tempFile, t.Destination, t.SHA1); err != nil {
		return fmt.Errorf("validation failed for %s: %w", t.NameID, err)
	}

	return nil
}

func (t *DownloadTask) Name() string {
	return t.NameID
}

func (t *DownloadTask) ensureDir() error {
	dir := filepath.Dir(t.Destination)
	return os.MkdirAll(dir, 0755)
}

func (t *DownloadTask) isAlreadyValid() bool {
	if _, err := os.Stat(t.Destination); os.IsNotExist(err) {
		return false
	}
	return VerifyFileSHA1(t.Destination, t.SHA1) == nil
}
