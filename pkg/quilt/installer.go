package quilt

import (
	"encoding/json"
	"fmt"
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/models"
	"os"
	"path/filepath"
)

func InstallQuilt(gameVersion string, loaderVersion string) (string, error) {
	versions, err := GetLoaderVersions(gameVersion)
	if err != nil {
		return "", err
	}

	var target *LoaderVersion
	if loaderVersion == "latest" || loaderVersion == "" {
		if len(versions) > 0 {
			target = &versions[0]
		}
	} else {
		for _, v := range versions {
			if v.Loader.Version == loaderVersion {
				vCopy := v
				target = &vCopy
				break
			}
		}
	}

	if target == nil {
		return "", fmt.Errorf("quilt loader %s not found for game %s", loaderVersion, gameVersion)
	}

	versionID := fmt.Sprintf("quilt-loader-%s-%s", target.Loader.Version, gameVersion)

	var libraries []models.Library

	libraries = append(libraries, models.Library{
		Name: target.Loader.Maven,
		URL:  "https://maven.quiltmc.org/repository/release/",
	})

	libraries = append(libraries, models.Library{
		Name: target.Intermediary.Maven,
		URL:  "https://maven.quiltmc.org/repository/release/",
	})

	for _, libs := range target.LauncherMeta.Libraries {
		for _, lib := range libs {
			libraries = append(libraries, models.Library{
				Name: lib.Name,
				URL:  lib.URL,
			})
		}
	}

	versionJSON := models.VersionDetail{
		ID:           versionID,
		InheritsFrom: gameVersion,
		Type:         "release",
		MainClass:    target.LauncherMeta.MainClass, 
		Libraries:    libraries,
	}

	versionsDir := constants.GetVersionsDir()
	versionDir := filepath.Join(versionsDir, versionID)
	jsonPath := filepath.Join(versionDir, fmt.Sprintf("%s.json", versionID))

	if err := os.MkdirAll(versionDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create version directory: %w", err)
	}

	data, err := json.MarshalIndent(versionJSON, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal version json: %w", err)
	}

	if err := os.WriteFile(jsonPath, data, 0644); err != nil {
		return "", fmt.Errorf("failed to write version json: %w", err)
	}

	return versionID, nil
}
