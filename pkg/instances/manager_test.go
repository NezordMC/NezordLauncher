package instances

import (
	"os"
	"testing"
)

func TestInstanceManager(t *testing.T) {
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	originalAppData := os.Getenv("APPDATA")
	os.Setenv("HOME", tempDir)
	os.Setenv("APPDATA", tempDir)
	defer func() {
		os.Setenv("HOME", originalHome)
		os.Setenv("APPDATA", originalAppData)
	}()

	mgr := NewManager() // Will use tempDir from Env

	inst, err := mgr.CreateInstance("My World", "1.20.1", ModloaderFabric, "0.14.25")
	if err != nil {
		t.Fatalf("Failed to create instance: %v", err)
	}

	if inst.Name != "My World" {
		t.Errorf("Expected name 'My World', got %s", inst.Name)
	}

	// Check File Existence
	// Path: tempDir/.config/NezordLauncher/instances/{id}/instance.json
	// Since ID is dynamic, we use inst.ID
	// We need to know the full path resolved by constants.
	// But simply checking if mgr.Get(id) works is enough for unit test logic.

	mgr2 := NewManager()
	if err := mgr2.Load(); err != nil {
		t.Fatalf("Failed to reload manager: %v", err)
	}

	loadedInst, ok := mgr2.Get(inst.ID)
	if !ok {
		t.Fatal("Instance not found after reload")
	}

	if loadedInst.GameVersion != "1.20.1" {
		t.Errorf("Persistence failed. Version mismatch.")
	}

	if err := mgr.DeleteInstance(inst.ID); err != nil {
		t.Errorf("Failed to delete: %v", err)
	}

	if _, ok := mgr.Get(inst.ID); ok {
		t.Error("Instance still exists in memory after delete")
	}
}
