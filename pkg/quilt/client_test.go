package quilt

import (
	"testing"
)

func TestGetLoaderVersions(t *testing.T) {
	gameVersion := "1.20.1"
	
	versions, err := GetLoaderVersions(gameVersion)
	if err != nil {
		t.Fatalf("Failed to get quilt versions: %v", err)
	}

	if len(versions) == 0 {
		t.Fatal("Expected at least one quilt version, got 0")
	}

	first := versions[0]
	t.Logf("Found Quilt Loader: %s", first.Loader.Version)

	if first.Intermediary.Version != gameVersion {
		t.Errorf("Expected intermediary version %s, got %s", gameVersion, first.Intermediary.Version)
	}
}
