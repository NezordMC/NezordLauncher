package javascanner

import "testing"

func TestSelectJava(t *testing.T) {
	installs := []JavaInfo{
		{Path: "/usr/lib/jvm/java-8/bin/java", Version: "1.8.0_382", Major: 8},
		{Path: "/usr/lib/jvm/java-17/bin/java", Version: "17.0.8", Major: 17},
		{Path: "/opt/java/java-21/bin/java", Version: "21.0.1", Major: 21},
	}

	tests := []struct {
		mcVersion   string
		expectedVer string
	}{
		{mcVersion: "1.16.5", expectedVer: "1.8.0_382"},
		{mcVersion: "1.20.1", expectedVer: "17.0.8"},
		{mcVersion: "1.20.6", expectedVer: "21.0.1"},
		{mcVersion: "1.21", expectedVer: "21.0.1"},
	}

	for _, tt := range tests {
		t.Run(tt.mcVersion, func(t *testing.T) {
			selected, err := SelectJava(installs, tt.mcVersion)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if selected.Version != tt.expectedVer {
				t.Fatalf("expected %s got %s", tt.expectedVer, selected.Version)
			}
		})
	}
}

func TestFallbackSelection(t *testing.T) {
	installs := []JavaInfo{
		{Path: "/opt/java/java-21/bin/java", Version: "21.0.1", Major: 21},
	}
	selected, err := SelectJava(installs, "1.7.10")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if selected.Major != 21 {
		t.Fatalf("expected fallback to 21 got %d", selected.Major)
	}
}

func TestRequiredJavaMajor(t *testing.T) {
	expectations := map[string]int{
		"1.7.10": 8,
		"1.12.2": 8,
		"1.16.5": 8,
		"1.17":   17,
		"1.18.2": 17,
		"1.20.4": 17,
		"1.20.5": 21,
		"1.21":   21,
		"1.21.1": 21,
	}

	for ver, req := range expectations {
		got := getRequiredJavaMajor(ver)
		if got != req {
			t.Fatalf("mc %s expects %d got %d", ver, req, got)
		}
	}
}

func TestParseMinecraftVersion(t *testing.T) {
	v, ok := parseMinecraftVersion("1.20.5")
	if !ok {
		t.Fatalf("parse failed")
	}
	if v.major != 1 || v.minor != 20 || v.patch != 5 {
		t.Fatalf("unexpected parse result")
	}
}

func TestCompareJavaVersion(t *testing.T) {
	if compareJavaVersion("17.0.8", "17.0.7") <= 0 {
		t.Fatalf("compare failed")
	}
	if compareJavaVersion("1.8.0_382", "1.8.0_362") <= 0 {
		t.Fatalf("compare failed")
	}
}
