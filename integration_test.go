package main

import (
	"NezordLauncher/pkg/constants"
	"os"
	"path/filepath"
	"testing"
)

func TestEndToEndDownload(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	tempDir := t.TempDir()
	
	originalAppData := os.Getenv("APPDATA")
	originalHome := os.Getenv("HOME")
	
	os.Setenv("APPDATA", tempDir) // Windows
	os.Setenv("HOME", tempDir)    // Linux uses os.UserConfigDir which often defaults to HOME/.config
	
	defer func() {
		os.Setenv("APPDATA", originalAppData)
		os.Setenv("HOME", originalHome)
	}()

	app := NewApp()
	app.startup(nil)

	versionID := "rd-132211" 
	
	t.Logf("Starting Smoke Test: Downloading %s...", versionID)
	err := app.DownloadVersion(versionID)
	if err != nil {
		t.Fatalf("Smoke Test Failed: %v", err)
	}

	clientJar := filepath.Join(constants.GetInstancesDir(), versionID, versionID+".jar")
	if _, err := os.Stat(clientJar); os.IsNotExist(err) {
		t.Errorf("Client JAR missing at: %s", clientJar)
	} else {
		t.Logf("Verified: Client JAR exists at %s", clientJar)
	}

	info, _ := os.Stat(constants.GetInstancesDir())
	if !info.IsDir() {
		t.Error("Instances directory not created")
	}

	t.Log("Smoke Test Passed: The Engine works!")
}
