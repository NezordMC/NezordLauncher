package main

import (
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/fabric"
	"NezordLauncher/pkg/javascanner"
	"NezordLauncher/pkg/models"
	"NezordLauncher/pkg/network"
	"NezordLauncher/pkg/quilt"
	"NezordLauncher/pkg/settings"
	"NezordLauncher/pkg/system"
	"NezordLauncher/pkg/updater"
	"encoding/json"
	"fmt"
)

func (a *App) GetVanillaVersions() ([]models.Version, error) {
	client := network.NewHttpClient()
	data, err := client.Get(constants.VersionManifestV2URL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch manifest: %w", err)
	}

	var manifest models.VersionManifest
	if err := json.Unmarshal(data, &manifest); err != nil {
		return nil, fmt.Errorf("failed to parse manifest: %w", err)
	}

	var releases []models.Version
	for _, v := range manifest.Versions {
		if v.Type == "release" {
			releases = append(releases, v)
		}
	}

	return releases, nil
}

func (a *App) GetFabricLoaders(mcVersion string) ([]string, error) {
	loaders, err := fabric.GetLoaderVersions(mcVersion)
	if err != nil {
		return nil, err
	}

	var versions []string
	for _, l := range loaders {
		versions = append(versions, l.Loader.Version)
	}
	return versions, nil
}

func (a *App) GetQuiltLoaders(mcVersion string) ([]string, error) {
	loaders, err := quilt.GetLoaderVersions(mcVersion)
	if err != nil {
		return nil, err
	}

	var versions []string
	for _, l := range loaders {
		versions = append(versions, l.Loader.Version)
	}
	return versions, nil
}

func (a *App) GetSystemPlatform() system.SystemInfo {
	return system.GetSystemInfo()
}

func (a *App) GetSettings() settings.LauncherSettings {
	return a.settingsManager.Get()
}

func (a *App) UpdateGlobalSettings(s settings.LauncherSettings) error {
	return a.settingsManager.Update(s)
}

// CheckForUpdates checks if a new version is available
func (a *App) CheckForUpdates(currentVersion string) (*updater.UpdateInfo, error) {
	return updater.CheckForUpdate(currentVersion)
}

func (a *App) ScanJavaInstallations() ([]javascanner.JavaInfo, error) {
	return javascanner.ScanJavaInstallations()
}

func (a *App) VerifyJavaPath(path string) (*javascanner.JavaInfo, error) {
	return javascanner.CheckJava(path)
}
