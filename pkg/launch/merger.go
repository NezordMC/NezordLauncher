package launch

import (
	"NezordLauncher/pkg/models"
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
	result.Libraries = append(child.Libraries, parent.Libraries...)
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
