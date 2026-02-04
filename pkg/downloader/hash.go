package downloader

import (
	"crypto/sha1"
	"encoding/hex"
	"io"
	"os"
	"strings"
)

func VerifyFileSHA1(path string, expected string) (bool, error) {
	if expected == "" {
		return false, nil
	}

	f, err := os.Open(path)
	if err != nil {
		return false, err
	}
	defer f.Close()

	h := sha1.New()
	if _, err := io.Copy(h, f); err != nil {
		return false, err
	}

	actual := hex.EncodeToString(h.Sum(nil))
	return strings.EqualFold(actual, expected), nil
}
