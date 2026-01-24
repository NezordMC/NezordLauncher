package launch

import (
	"NezordLauncher/pkg/models"
	"testing"
)

func TestMergeVersions(t *testing.T) {
	parent := &models.VersionDetail{
		ID: "1.20.1",
		AssetIndex: models.AssetIndex{
			ID: "1.20",
		},
		Libraries: []models.Library{
			{Name: "org.lwjgl:lwjgl:3.3.1"},
		},
		Arguments: models.Arguments{
			JVM: []models.Argument{{Values: []string{"-Xmx2G"}}},
		},
	}

	child := &models.VersionDetail{
		ID:           "1.20.1-fabric-0.14.25",
		InheritsFrom: "1.20.1",
		MainClass:    models.MainClassData{Client: "net.fabricmc.loader.impl.launch.knot.KnotClient"},
		Libraries: []models.Library{
			{Name: "net.fabricmc:fabric-loader:0.14.25"},
		},
		Arguments: models.Arguments{
			JVM: []models.Argument{{Values: []string{"-Dfabric.d=true"}}},
		},
	}

	result := MergeVersions(child, parent)

	// Test 1: ID should remain Child's ID
	if result.ID != child.ID {
		t.Errorf("Expected ID %s, got %s", child.ID, result.ID)
	}

	// Test 2: Assets should be inherited from Parent
	if result.AssetIndex.ID != "1.20" {
		t.Error("Failed to inherit AssetIndex from parent")
	}

	// Test 3: Libraries should be combined (1 child + 1 parent = 2)
	if len(result.Libraries) != 2 {
		t.Errorf("Expected 2 libraries, got %d", len(result.Libraries))
	}

	// Test 4: Arguments should be combined
	if len(result.Arguments.JVM) != 2 {
		t.Errorf("Expected 2 JVM args, got %d", len(result.Arguments.JVM))
	}

	// Test 5: Jar should point to parent ID (default behavior if empty)
	if result.Jar != "1.20.1" {
		t.Errorf("Expected Jar to point to parent ID (1.20.1), got %s", result.Jar)
	}
}
