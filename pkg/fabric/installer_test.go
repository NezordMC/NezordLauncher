package fabric

import (
	"encoding/json"
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/models"
	"os"
	"path/filepath"
	"testing"
)

func TestInstallFabric(t *testing.T) {
	tempDir := t.TempDir()
	
	originalHome := os.Getenv("HOME")
	originalAppData := os.Getenv("APPDATA")
	
	os.Setenv("HOME", tempDir)
	os.Setenv("APPDATA", tempDir)
	defer func() {
		os.Setenv("HOME", originalHome)
		os.Setenv("APPDATA", originalAppData)
	}()

	gameVersion := "1.20.1"
	
	installedID, err := InstallFabric(gameVersion, "latest")
	if err != nil {
		t.Fatalf("InstallFabric failed: %v", err)
	}
	
	t.Logf("Fabric Installed ID: %s", installedID)

	expectedPath := filepath.Join(constants.GetVersionsDir(), installedID, installedID+".json")
	if _, err := os.Stat(expectedPath); os.IsNotExist(err) {
		t.Errorf("Version JSON not created at %s", expectedPath)
	}

	data, _ := os.ReadFile(expectedPath)
	var version models.VersionDetail
	if err := json.Unmarshal(data, &version); err != nil {
		t.Fatalf("Failed to parse generated JSON: %v", err)
	}

	if version.InheritsFrom != gameVersion {
		t.Errorf("InheritsFrom mismatch. Got %s, want %s", version.InheritsFrom, gameVersion)
	}
	
	if len(version.Libraries) < 2 {
		t.Errorf("Too few libraries. Expected at least loader & intermediary.")
	}

	hasLoader := false
	for _, lib := range version.Libraries {
		if lib.URL == "https://maven.fabricmc.net/" {
			hasLoader = true
		}
	}

	if !hasLoader {
		t.Error("Fabric Maven URL not found in libraries")
	}
}
