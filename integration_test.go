package main

import (
	"NezordLauncher/pkg/constants"
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestIntegration_LaunchGame(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	tempDir := t.TempDir()
	originalAppData := os.Getenv("APPDATA")
	originalHome := os.Getenv("HOME")
	
	os.Setenv("APPDATA", tempDir)
	os.Setenv("HOME", tempDir) 
	
	defer func() {
		os.Setenv("APPDATA", originalAppData)
		os.Setenv("HOME", originalHome)
	}()

	app := NewApp()
	app.EnableTestMode()
	
	app.startup(context.Background())

	versionID := "rd-132211" 
	t.Logf("Downloading %s...", versionID)
	
	if err := app.DownloadVersion(versionID); err != nil {
		t.Fatalf("Download failed: %v", err)
	}

	// Setup Account
	account, err := app.AddOfflineAccount("TesterBot")
	if err != nil {
		t.Fatalf("Failed to create offline account: %v", err)
	}
	if err := app.SetActiveAccount(account.UUID); err != nil {
		t.Fatalf("Failed to set active account: %v", err)
	}

	// Create Instance
	instance, err := app.CreateInstance("TestInstance", versionID, "vanilla", "")
	if err != nil {
		t.Fatalf("Failed to create instance: %v", err)
	}

	t.Logf("Launching instance %s (%s)...", instance.Name, instance.ID)
	
	// Launch
	err = app.LaunchInstance(instance.ID)
	
	if err != nil {
		t.Fatalf("Launch failed: %v", err)
	}

	nativesDir := filepath.Join(constants.GetInstancesDir(), instance.ID, "natives")
	if _, err := os.Stat(nativesDir); os.IsNotExist(err) {
		t.Errorf("Natives directory missing at %s. Launch process might have aborted early.", nativesDir)
	} else {
		t.Log("Verified: Natives extracted successfully.")
	}

	time.Sleep(2 * time.Second)
	t.Log("Integration Test Passed: Launch sequence initiated successfully.")
}
