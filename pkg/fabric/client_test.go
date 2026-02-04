package fabric

import (
	"testing"
)

func TestGetLoaderVersions(t *testing.T) {
	gameVersion := "1.20.1"

	versions, err := GetLoaderVersions(gameVersion)
	if err != nil {
		t.Fatalf("Failed to get fabric versions: %v", err)
	}

	if len(versions) == 0 {
		t.Fatal("Expected at least one fabric version, got 0")
	}

	first := versions[0]
	t.Logf("Found Fabric Loader: %s (Stable: %v)", first.Loader.Version, first.Loader.Stable)

	if first.Intermediary.Version != gameVersion {
		t.Errorf("Expected intermediary version %s, got %s", gameVersion, first.Intermediary.Version)
	}
}

func TestGetLoaderVersions_Invalid(t *testing.T) {
	gameVersion := "9.9.9"

	_, err := GetLoaderVersions(gameVersion)
	if err == nil {
		t.Error("Expected error for non-existent game version, got nil")
	}
}
