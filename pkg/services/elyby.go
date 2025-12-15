package services

import (
	"fmt"
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/network"
	"os"
	"path/filepath"
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
	client := network.NewHttpClient()
	
	data, err := client.Get(AuthlibInjectorURL)
	if err != nil {
		return "", fmt.Errorf("failed to download authlib-injector from %s: %w", AuthlibInjectorURL, err)
	}

	if err := os.WriteFile(path, data, 0644); err != nil {
		return "", fmt.Errorf("failed to write authlib-injector file: %w", err)
	}

	return path, nil
}
