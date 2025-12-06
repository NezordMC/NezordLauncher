package launch

import (
	"NezordLauncher/pkg/models"
	"strings"
	"testing"
)

func TestBuildArguments_Modern(t *testing.T) {
	// Mock Version 1.19+ (Modern JSON Structure)
	version := &models.VersionDetail{
		ID:        "1.20.1",
		MainClass: "net.minecraft.client.main.Main",
		Type:      "release",
		Arguments: models.Arguments{
			Game: []models.Argument{
				{Values: []string{"--username", "${auth_player_name}"}},
				{Values: []string{"--version", "${version_name}"}},
			},
			JVM: []models.Argument{
				{Values: []string{"-Djava.library.path=${natives_directory}"}},
				{Values: []string{"-cp", "${classpath}"}},
			},
		},
		AssetIndex: models.AssetIndex{ID: "1.20"},
	}

	opts := LaunchOptions{
		PlayerName: "NezordUser",
		VersionID:  "1.20.1",
		GameDir:    "/tmp/mc",
		NativesDir: "/tmp/natives",
		RamMB:      2048,
	}

	args, err := BuildArguments(version, opts)
	if err != nil {
		t.Fatalf("Failed to build args: %v", err)
	}

	// Validation
	argStr := strings.Join(args, " ")
	
	// Check standard JVM args
	if !strings.Contains(argStr, "-Xmx2048M") {
		t.Error("Missing RAM argument")
	}
	if !strings.Contains(argStr, "-Djava.library.path=/tmp/natives") {
		t.Error("Missing natives path")
	}

	// Check Variable Substitution
	if !strings.Contains(argStr, "--username NezordUser") {
		t.Error("Failed to substitute ${auth_player_name}")
	}
	if !strings.Contains(argStr, "--version 1.20.1") {
		t.Error("Failed to substitute ${version_name}")
	}
	
	t.Logf("Generated Modern Args: %v", args)
}

func TestBuildArguments_Legacy(t *testing.T) {
	// Mock Version 1.7.10 (Legacy String Structure)
	version := &models.VersionDetail{
		ID:                 "1.7.10",
		MainClass:          "net.minecraft.client.main.Main",
		MinecraftArguments: "--username ${auth_player_name} --version ${version_name} --gameDir ${game_directory}",
		// Arguments struct is empty/nil for legacy
	}

	opts := LaunchOptions{
		PlayerName: "LegacySteve",
		VersionID:  "1.7.10",
		GameDir:    "/tmp/legacy_mc",
		RamMB:      1024,
	}

	args, err := BuildArguments(version, opts)
	if err != nil {
		t.Fatalf("Failed to build legacy args: %v", err)
	}

	argStr := strings.Join(args, " ")

	// Legacy versions MUST fallback to default JVM args (-cp)
	if !strings.Contains(argStr, "-cp") {
		t.Error("Missing -cp argument in legacy mode")
	}
	
	// Check legacy string parsing
	if !strings.Contains(argStr, "--username LegacySteve") {
		t.Error("Failed to parse legacy minecraftArguments")
	}
	if !strings.Contains(argStr, "/tmp/legacy_mc") {
		t.Error("Failed to substitute gameDir")
	}

	t.Logf("Generated Legacy Args: %v", args)
}
