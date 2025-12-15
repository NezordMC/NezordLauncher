package services

import (
	"NezordLauncher/pkg/constants"
	"os"
	"testing"
)

func TestEnsureAuthlibInjector(t *testing.T) {
	tempDir := t.TempDir()
	
	originalHome := os.Getenv("HOME")
	originalAppData := os.Getenv("APPDATA")
	
	os.Setenv("HOME", tempDir)       // Linux/Mac
	os.Setenv("APPDATA", tempDir)    // Windows
	defer func() {
		os.Setenv("HOME", originalHome)
		os.Setenv("APPDATA", originalAppData)
	}()

	path, err := EnsureAuthlibInjector()
	if err != nil {
		t.Fatalf("Failed to ensure authlib injector: %v", err)
	}
	if _, err := os.Stat(path); os.IsNotExist(err) {
		t.Errorf("Authlib injector file not found at %s", path)
	} else {
		t.Logf("Authlib injector successfully downloaded to: %s", path)
	}

	path2, err := EnsureAuthlibInjector()
	if err != nil {
		t.Fatalf("Subsequent call failed: %v", err)
	}
	if path != path2 {
		t.Errorf("Path mismatch on second call")
	}
}

func TestGetAuthlibInjectorPath(t *testing.T) {
	path := GetAuthlibInjectorPath()
	if path == "" {
		t.Error("Path should not be empty")
	}
	expectedDir := constants.GetRuntimesDir()
	if len(path) <= len(expectedDir) {
		t.Errorf("Path seems too short, expected inside %s", expectedDir)
	}
}
