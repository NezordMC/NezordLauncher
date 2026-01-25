package services

import (
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/network"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const (
	AuthlibInjectorURL     = "https://github.com/yushijinhun/authlib-injector/releases/download/v1.2.7/authlib-injector-1.2.7.jar"
	AuthlibInjectorVersion = "1.2.7"
	ElyByServiceID         = "ely.by"
)

func GetAuthlibInjectorPath() string {
	return filepath.Join(constants.GetRuntimesDir(), fmt.Sprintf("authlib-injector-%s.jar", AuthlibInjectorVersion))
}

func EnsureAuthlibInjector() (string, error) {
	path := GetAuthlibInjectorPath()

	if _, err := os.Stat(path); err == nil {
		return path, nil
	}

	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return "", fmt.Errorf("failed to create runtimes directory: %w", err)
	}
	sourceURL := authlibInjectorURL()
	data, err := fetchAuthlibData(sourceURL)
	if err != nil {
		return "", err
	}

	if err := os.WriteFile(path, data, 0644); err != nil {
		return "", fmt.Errorf("failed to write authlib-injector file: %w", err)
	}

	return path, nil
}

func authlibInjectorURL() string {
	url := os.Getenv("NEZORD_AUTHLIB_INJECTOR_URL")
	if url == "" {
		url = AuthlibInjectorURL
	}
	return url
}

func fetchAuthlibData(url string) ([]byte, error) {
	if strings.HasPrefix(url, "file://") {
		path := strings.TrimPrefix(url, "file://")
		data, err := os.ReadFile(path)
		if err != nil {
			return nil, fmt.Errorf("failed to read authlib injector file: %w", err)
		}
		return data, nil
	}
	client := network.NewHttpClient()
	data, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to download authlib-injector from %s: %w", url, err)
	}
	return data, nil
}
