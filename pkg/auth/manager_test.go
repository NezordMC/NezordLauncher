package auth

import (
	"os"
	"testing"
)

func TestAccountManager(t *testing.T) {

	tempDir := t.TempDir()
	
	originalHome := os.Getenv("HOME")
	originalAppData := os.Getenv("APPDATA")
	

	os.Setenv("HOME", tempDir)
	os.Setenv("APPDATA", tempDir)
	defer func() {
		os.Setenv("HOME", originalHome)
		os.Setenv("APPDATA", originalAppData)
	}()

	manager := NewAccountManager()
	

	username := "Steve"
	acc, err := manager.AddOfflineAccount(username)
	if err != nil {
		t.Fatalf("Failed to add account: %v", err)
	}
	
	if acc.Username != username {
		t.Errorf("Expected username %s, got %s", username, acc.Username)
	}
	

	manager2 := NewAccountManager()
	if err := manager2.Load(); err != nil {
		t.Fatalf("Failed to reload manager: %v", err)
	}
	
	active := manager2.GetActiveAccount()
	if active == nil {
		t.Fatal("Active account is nil after reload")
	}
	

	if active.UUID != acc.UUID {
		t.Errorf("Persistence failed. Expected UUID %s, got %s", acc.UUID, active.UUID)
	}
	

	acc2, _ := manager.AddOfflineAccount("Alex")
	

	if manager.Data.ActiveUUID != acc2.UUID {
		t.Error("Adding new account did not make it active")
	}
	

	if err := manager.SetActiveAccount(acc.UUID); err != nil {
		t.Errorf("Failed to switch account: %v", err)
	}
	
	if manager.GetActiveAccount().Username != "Steve" {
		t.Error("Switch account failed")
	}
	
	t.Logf("Final Active Account: %s (%s)", manager.GetActiveAccount().Username, manager.GetActiveAccount().UUID)
}