package constants

import (
	"os"
	"path/filepath"
	"runtime"
)

const (
	AppName              = "NezordLauncher"
	Version              = "0.2.0"
	VersionManifestV2URL = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
	ResourcesURL         = "https://resources.download.minecraft.net/"
)

func GetAppDataDir() string {
	return GetDataDir()
}

func GetConfigDir() string {
	if runtime.GOOS == "windows" {
		// Portable mode: config is in the same dir as data
		return GetDataDir()
	}

	var baseDir string
	configDir := os.Getenv("XDG_CONFIG_HOME")
	if configDir == "" {
		configDir, _ = os.UserConfigDir()
	}
	baseDir = configDir
	return filepath.Join(baseDir, AppName)
}

func GetDataDir() string {
	if override := os.Getenv("NEZORD_DATA_DIR"); override != "" {
		return override
	}

	var baseDir string
	if runtime.GOOS == "windows" {
		// Development mode check: if wails.json exists in the current directory, use ./data
		cwd, err := os.Getwd()
		if err == nil {
			if _, err := os.Stat(filepath.Join(cwd, "wails.json")); err == nil {
				return filepath.Join(cwd, "data")
			}
		}

		exePath, err := os.Executable()
		if err != nil {
			// Fallback to APPDATA if exe path fails
			baseDir = os.Getenv("APPDATA")
			return filepath.Join(baseDir, AppName)
		}
		// Data dir should be the same as exe dir for portable mode
		return filepath.Dir(exePath)
	}

	dataDir := os.Getenv("XDG_DATA_HOME")
	if dataDir == "" {
		home, _ := os.UserHomeDir()
		if home != "" {
			dataDir = filepath.Join(home, ".local", "share")
		}
	}
	if dataDir == "" {
		dataDir, _ = os.UserConfigDir()
	}
	baseDir = dataDir
	return filepath.Join(baseDir, AppName)
}

func GetInstancesDir() string {
	return filepath.Join(GetDataDir(), "instances")
}

func GetAssetsDir() string {
	return filepath.Join(GetDataDir(), "assets")
}

func GetLibrariesDir() string {
	return filepath.Join(GetDataDir(), "libraries")
}

func GetRuntimesDir() string {
	return filepath.Join(GetDataDir(), "runtimes")
}

func GetVersionsDir() string {
	return filepath.Join(GetDataDir(), "versions")
}

func GetLogsDir() string {
	return filepath.Join(GetDataDir(), "logs")
}
