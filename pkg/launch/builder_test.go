package launch

import (
	"NezordLauncher/pkg/models"
	"strings"
	"testing"
)

func TestBuildArguments_Modern(t *testing.T) {
	version := &models.VersionDetail{
		ID:        "1.20.1",
		MainClass: models.MainClassData{Client: "net.minecraft.client.main.Main"},
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

	argStr := strings.Join(args, " ")

	if !strings.Contains(argStr, "-Xmx2048M") {
		t.Error("Missing RAM argument")
	}
	if !strings.Contains(argStr, "-Djava.library.path=/tmp/natives") {
		t.Error("Missing natives path")
	}
	if !strings.Contains(argStr, "-Dorg.lwjgl.librarypath=/tmp/natives") {
		t.Error("Missing lwjgl natives path")
	}
	if !strings.Contains(argStr, "-Duser.language=en") {
		t.Error("Missing language setting")
	}
	if !strings.Contains(argStr, "-Duser.country=US") {
		t.Error("Missing country setting")
	}

	if !strings.Contains(argStr, "--username NezordUser") {
		t.Error("Failed to substitute ${auth_player_name}")
	}
}

func TestBuildArguments_Authlib(t *testing.T) {
	version := &models.VersionDetail{
		ID:        "1.20.1",
		MainClass: models.MainClassData{Client: "net.minecraft.client.main.Main"},
	}

	opts := LaunchOptions{
		PlayerName:          "ElyUser",
		VersionID:           "1.20.1",
		AuthlibInjectorPath: "/path/to/authlib.jar",
	}

	args, err := BuildArguments(version, opts)
	if err != nil {
		t.Fatalf("Failed to build args: %v", err)
	}

	argStr := strings.Join(args, " ")

	expected := "-javaagent:/path/to/authlib.jar=ely.by"
	if !strings.Contains(argStr, expected) {
		t.Errorf("Missing javaagent argument. Got: %s", argStr)
	}
}

func TestBuildArguments_Legacy(t *testing.T) {
	version := &models.VersionDetail{
		ID:                 "1.7.10",
		MainClass:          models.MainClassData{Client: "net.minecraft.client.main.Main"},
		MinecraftArguments: "--username ${auth_player_name} --version ${version_name} --gameDir ${game_directory}",
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

	if !strings.Contains(argStr, "-cp") {
		t.Error("Missing -cp argument in legacy mode")
	}
}

func TestBuildArguments_UserTypeMapping(t *testing.T) {
	version := &models.VersionDetail{
		ID:        "1.20.1",
		MainClass: models.MainClassData{Client: "Main"},
		Arguments: models.Arguments{
			Game: []models.Argument{
				{Values: []string{"--userType", "${user_type}"}},
			},
		},
	}

	optsOffline := LaunchOptions{UserType: "offline"}
	args1, _ := BuildArguments(version, optsOffline)
	argStr1 := strings.Join(args1, " ")
	if !strings.Contains(argStr1, "--userType legacy") {
		t.Errorf("Failed to map 'offline' to 'legacy'. Got: %s", argStr1)
	}

	optsEly := LaunchOptions{UserType: "elyby"}
	args2, _ := BuildArguments(version, optsEly)
	argStr2 := strings.Join(args2, " ")
	if !strings.Contains(argStr2, "--userType mojang") {
		t.Errorf("Failed to map 'elyby' to 'mojang'. Got: %s", argStr2)
	}
}
