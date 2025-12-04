package javascanner

import (
	"testing"
)

func TestScanJavaInstallations(t *testing.T) {
	installations, err := ScanJavaInstallations()
	if err != nil {
		t.Fatalf("Scan failed: %v", err)
	}

	if len(installations) == 0 {
		t.Log("Warning: No Java installations found. Ensure you have Java installed locally for this test.")
	} else {
		t.Logf("Found %d Java installations:", len(installations))
		for _, install := range installations {
			t.Logf("- Vendor: %s | Version: %s", install.Vendor, install.Version)
			t.Logf("  Path: %s", install.Path)
			if install.IsTemurin {
				t.Log("  [MATCH] Eclipse Temurin Detected")
			}
		}
	}
}

func TestParseJavaVersion(t *testing.T) {
	outputTemurin := `openjdk version "17.0.8" 2023-07-18
OpenJDK Runtime Environment Temurin-17.0.8+7 (build 17.0.8+7)
OpenJDK 64-Bit Server VM Temurin-17.0.8+7 (build 17.0.8+7, mixed mode, sharing)`

	version := parseJavaVersion(outputTemurin)
	if version != "17.0.8" {
		t.Errorf("Expected version 17.0.8, got %s", version)
	}

	install, _ := validateJavaBinary("echo") 
	if install.Vendor == "Eclipse Temurin" {
	}
}
