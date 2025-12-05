package javascanner

import (
	"testing"
)

func TestSelectJava(t *testing.T) {
	mockInstalls := []JavaInstallation{
		{Path: "/usr/lib/jvm/java-8", Version: "1.8.0_382", Vendor: "OpenJDK", IsTemurin: false},
		{Path: "/usr/lib/jvm/java-17", Version: "17.0.8", Vendor: "Eclipse Temurin", IsTemurin: true},
		{Path: "/opt/java/java-21", Version: "21.0.1", Vendor: "Oracle", IsTemurin: false},
	}

	tests := []struct {
		mcVersion      string
		expectedVer    string
		expectedFuzzy  bool 
		description    string
	}{
		{
			mcVersion:   "1.16.5",
			expectedVer: "1.8.0_382",
			description: "Should select Java 8 (Exact Match)",
		},
		{
			mcVersion:   "1.20.1",
			expectedVer: "17.0.8",
			description: "Should select Java 17 (Exact Match)",
		},
		{
			mcVersion:   "1.20.6",
			expectedVer: "21.0.1",
			description: "Should select Java 21 (Exact Match)",
		},
		{
			mcVersion:   "1.21",
			expectedVer: "21.0.1",
			description: "Should select Java 21 (Exact Match for 1.21)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			selected, err := SelectJava(mockInstalls, tt.mcVersion)
			if err != nil {
				t.Fatalf("Unexpected error: %v", err)
			}
			if selected.Version != tt.expectedVer {
				t.Errorf("Expected version %s, got %s", tt.expectedVer, selected.Version)
			}
			t.Logf("[SUCCESS] MC %s -> Java %s (%s)", tt.mcVersion, selected.Version, selected.Vendor)
		})
	}
}

func TestFuzzyFallback(t *testing.T) {
	onlyJava21 := []JavaInstallation{
		{Path: "/opt/java/java-21", Version: "21.0.1", Vendor: "Oracle", IsTemurin: false},
	}

	mcVersion := "1.7.10"
	selected, err := SelectJava(onlyJava21, mcVersion)
	
	if err != nil {
		t.Fatalf("Smart Mode failed, no java selected: %v", err)
	}

	if selected.Version != "21.0.1" {
		t.Errorf("Expected fallback to Java 21, got %s", selected.Version)
	}

	t.Logf("[SMART MODE ACTIVE] MC %s (needs Java 8) -> Launched with Java %s", mcVersion, selected.Version)
}

func TestRequirementLogic(t *testing.T) {
	expectations := map[string]int{
		"1.7.10":  8,
		"1.12.2":  8,
		"1.16.5":  8,
		"1.17":    17,
		"1.18.2":  17,
		"1.20.4":  17,
		"1.20.5":  21,
		"1.21":    21,
		"1.21.1":  21,
	}

	for ver, req := range expectations {
		got := getRequiredJavaVersion(ver)
		if got != req {
			t.Errorf("MC %s should require %d, got %d", ver, req, got)
		}
	}
}
