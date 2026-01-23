package javascanner

import "testing"

func TestParseJavaVersion(t *testing.T) {
	output := `openjdk version "17.0.8" 2023-07-18
OpenJDK Runtime Environment Temurin-17.0.8+7 (build 17.0.8+7)
OpenJDK 64-Bit Server VM Temurin-17.0.8+7 (build 17.0.8+7, mixed mode, sharing)`

	version := parseJavaVersion(output)
	if version != "17.0.8" {
		t.Fatalf("expected 17.0.8 got %s", version)
	}
}

func TestParseMajorVersion(t *testing.T) {
	if parseMajorVersion("1.8.0_382") != 8 {
		t.Fatalf("expected 8")
	}
	if parseMajorVersion("17.0.8") != 17 {
		t.Fatalf("expected 17")
	}
	if parseMajorVersion("21") != 21 {
		t.Fatalf("expected 21")
	}
}
