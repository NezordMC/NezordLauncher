package launch

import (
	"NezordLauncher/pkg/models"
	"strings"
)

func MergeVersions(child, parent *models.VersionDetail) *models.VersionDetail {
	result := *child

	if result.AssetIndex.ID == "" {
		result.AssetIndex = parent.AssetIndex
	}
	if result.Assets == "" {
		result.Assets = parent.Assets
	}
	if result.Downloads.Client.URL == "" {
		result.Downloads = parent.Downloads
	}
	if result.Type == "" {
		result.Type = parent.Type
	}

	if result.Jar == "" {
		result.Jar = parent.ID
	}
	result.Libraries = deduplicateLibraries(child.Libraries, parent.Libraries)
	result.Arguments = mergeArguments(child.Arguments, parent.Arguments)

	if result.MinecraftArguments == "" && parent.MinecraftArguments != "" {
		result.MinecraftArguments = parent.MinecraftArguments
	} else if result.MinecraftArguments != "" && parent.MinecraftArguments != "" {
		result.MinecraftArguments = result.MinecraftArguments + " " + parent.MinecraftArguments
	}

	return &result
}

func mergeArguments(child, parent models.Arguments) models.Arguments {
	return models.Arguments{
		Game: append(child.Game, parent.Game...),
	JVM:  append(child.JVM, parent.JVM...),
	}
}

func deduplicateLibraries(childLibs, parentLibs []models.Library) []models.Library {
	seen := make(map[string]int)
	var result []models.Library

	getKey := func(name string) string {
		parts := strings.Split(name, ":")
		if len(parts) >= 4 {
			return parts[0] + ":" + parts[1] + ":" + parts[3]
		}
		if len(parts) >= 2 {
			return parts[0] + ":" + parts[1]
		}
		return name
	}

	for _, lib := range childLibs {
		key := getKey(lib.Name)
		if _, exists := seen[key]; !exists {
			seen[key] = len(result)
			result = append(result, lib)
		}
	}

	for _, lib := range parentLibs {
		key := getKey(lib.Name)
		if idx, exists := seen[key]; !exists {
			seen[key] = len(result)
			result = append(result, lib)
		} else {
			if len(lib.Natives) > 0 {
				if result[idx].Natives == nil {
					result[idx].Natives = make(map[string]string)
				}
				for osKey, classifier := range lib.Natives {
					if _, exists := result[idx].Natives[osKey]; !exists {
						result[idx].Natives[osKey] = classifier
					}
				}
			}

			if len(lib.Downloads.Classifiers) > 0 {
				if result[idx].Downloads.Classifiers == nil {
					result[idx].Downloads.Classifiers = make(map[string]models.DownloadInfo)
				}
				for key, downloadInfo := range lib.Downloads.Classifiers {
					if _, exists := result[idx].Downloads.Classifiers[key]; !exists {
						result[idx].Downloads.Classifiers[key] = downloadInfo
					}
				}
			}
		}
	}

	return result
}
