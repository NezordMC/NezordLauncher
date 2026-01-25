package services

import (
	"NezordLauncher/pkg/constants"
	"os"
	"path/filepath"
	"testing"
)

func TestEnsureAuthlibInjector(t *testing.T) {
	tempDir := t.TempDir()

	originalHome := os.Getenv("HOME")
	originalAppData := os.Getenv("APPDATA")
	originalURL := os.Getenv("NEZORD_AUTHLIB_INJECTOR_URL")

	os.Setenv("HOME", tempDir)
	os.Setenv("APPDATA", tempDir)
	defer func() {
		os.Setenv("HOME", originalHome)
		os.Setenv("APPDATA", originalAppData)
		os.Setenv("NEZORD_AUTHLIB_INJECTOR_URL", originalURL)
	}()

	sourceFile := filepath.Join(tempDir, "authlib.jar")
	if err := os.WriteFile(sourceFile, []byte("mock-authlib"), 0644); err != nil {
		t.Fatalf("Failed to create mock authlib file: %v", err)
	}
	os.Setenv("NEZORD_AUTHLIB_INJECTOR_URL", "file://"+sourceFile)

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
