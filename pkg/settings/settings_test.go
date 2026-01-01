package settings

import (
	"path/filepath"
	"testing"
)

func TestSettingsManager(t *testing.T) {
	tmpDir := t.TempDir()
	
	manager := &Manager{
		filePath: filepath.Join(tmpDir, "settings.json"),
		Data: LauncherSettings{
			Language: "en",
			Theme: "dark",
		},
	}

	if err := manager.saveInternal(); err != nil {
		t.Fatalf("Failed to save initial settings: %v", err)
	}

	newManager := &Manager{
		filePath: filepath.Join(tmpDir, "settings.json"),
	}
	
	if err := newManager.Load(); err != nil {
		t.Fatalf("Failed to load settings: %v", err)
	}

	if newManager.Data.Theme != "dark" {
		t.Errorf("Expected theme 'dark', got '%s'", newManager.Data.Theme)
	}

	update := LauncherSettings{
		Language: "id",
		Theme: "light",
	}
	
	if err := newManager.Update(update); err != nil {
		t.Fatalf("Failed to update settings: %v", err)
	}

	finalManager := &Manager{
		filePath: filepath.Join(tmpDir, "settings.json"),
	}
	if err := finalManager.Load(); err != nil {
		t.Fatalf("Failed to load final settings: %v", err)
	}

	if finalManager.Data.Language != "id" {
		t.Errorf("Expected language 'id', got '%s'", finalManager.Data.Language)
	}
}
