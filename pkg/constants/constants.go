package constants

import (
	"os"
	"path/filepath"
	"runtime"
)

const (
	AppName              = "NezordLauncher"
	VersionManifestV2URL = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
	ResourcesURL         = "https://resources.download.minecraft.net/"
)

func GetAppDataDir() string {
	var baseDir string
	if runtime.GOOS == "windows" {
		baseDir = os.Getenv("APPDATA")
	} else {
		configDir, _ := os.UserConfigDir()
		baseDir = configDir
	}
	return filepath.Join(baseDir, AppName)
}

func GetInstancesDir() string {
	return filepath.Join(GetAppDataDir(), "instances")
}

func GetAssetsDir() string {
	return filepath.Join(GetAppDataDir(), "assets")
}

func GetLibrariesDir() string {
	return filepath.Join(GetAppDataDir(), "libraries")
}

func GetRuntimesDir() string {
	return filepath.Join(GetAppDataDir(), "runtimes")
}

func GetVersionsDir() string {
	return filepath.Join(GetAppDataDir(), "versions")
}
