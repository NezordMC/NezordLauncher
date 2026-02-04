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
			{Name: "org.ow2.asm:asm:9.6"},
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
			{Name: "org.ow2.asm:asm:9.9"},
		},
		Arguments: models.Arguments{
			JVM: []models.Argument{{Values: []string{"-Dfabric.d=true"}}},
		},
	}

	result := MergeVersions(child, parent)

	if result.ID != child.ID {
		t.Errorf("Expected ID %s, got %s", child.ID, result.ID)
	}

	if result.AssetIndex.ID != "1.20" {
		t.Error("Failed to inherit AssetIndex from parent")
	}

	expectedLibs := 3
	if len(result.Libraries) != expectedLibs {
		t.Errorf("Expected %d libraries, got %d", expectedLibs, len(result.Libraries))
	}

	found := false
	for _, lib := range result.Libraries {
		if lib.Name == "org.ow2.asm:asm:9.9" {
			found = true
			break
		}
		if lib.Name == "org.ow2.asm:asm:9.6" {
			t.Error("Found older ASM 9.6 which should have been overridden")
		}
	}
	if !found {
		t.Error("Did not find expected ASM 9.9")
	}

	if len(result.Arguments.JVM) != 2 {
		t.Errorf("Expected 2 JVM args, got %d", len(result.Arguments.JVM))
	}

	if result.Jar != "1.20.1" {
		t.Errorf("Expected Jar to point to parent ID (1.20.1), got %s", result.Jar)
	}
}

func TestMergeVersions_PreserveNatives(t *testing.T) {
	parent := &models.VersionDetail{
		ID: "1.20.1",
		Libraries: []models.Library{
			{
				Name:    "org.lwjgl:lwjgl:3.3.1",
				Natives: map[string]string{
					"linux":   "natives-linux",
					"windows": "natives-windows",
				},
				Downloads: models.LibraryDownloadMap{
					Classifiers: map[string]models.DownloadInfo{
						"natives-linux":   {URL: "http://natives-linux.jar"},
						"natives-windows": {URL: "http://natives-windows.jar"},
					},
				},
			},
		},
	}

	child := &models.VersionDetail{
		ID:           "1.20.1-fabric",
		InheritsFrom: "1.20.1",
		Libraries: []models.Library{
			{
				Name:    "org.lwjgl:lwjgl:3.3.1",
				Natives: map[string]string{
					"windows": "natives-windows-custom", // Child has custom windows definition
				},
				Downloads: models.LibraryDownloadMap{
					Classifiers: map[string]models.DownloadInfo{
						"natives-windows-custom": {URL: "http://custom-windows.jar"},
					},
				},
			},
		},
	}

	result := MergeVersions(child, parent)

	if len(result.Libraries) != 1 {
		t.Fatalf("Expected 1 library, got %d", len(result.Libraries))
	}

	lib := result.Libraries[0]
	
	// Verify Child's Windows native is preserved (not overwritten)
	if lib.Natives["windows"] != "natives-windows-custom" {
		t.Errorf("Expected windows native 'natives-windows-custom', got '%s'", lib.Natives["windows"])
	}

	// Verify Parent's Linux native is MERGED in (was missing in Child)
	if lib.Natives["linux"] != "natives-linux" {
		t.Errorf("Expected linux native 'natives-linux', got '%s'", lib.Natives["linux"])
	}

	// Verify Classifiers are also merged
	if _, ok := lib.Downloads.Classifiers["natives-linux"]; !ok {
		t.Error("Failed to merge classifiers for linux")
	}
	if _, ok := lib.Downloads.Classifiers["natives-windows-custom"]; !ok {
		t.Error("Failed to preserve child classifiers for windows")
	}
}
