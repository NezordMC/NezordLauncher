package system

import (
	"NezordLauncher/pkg/models"
	"strings"
)

func ShouldDownload(rules []models.Rule) bool {
	if len(rules) == 0 {
		return true
	}

	systemInfo := GetSystemInfo()
	result := false

	for _, rule := range rules {
		allow := rule.Action == "allow"

		if rule.OS.Name == "" {
			result = allow
			continue
		}

		if rule.OS.Name == systemInfo.OS {
			result = allow
		}
	}

	return result
}

func GetNativeClassifier(library models.Library) string {
	if library.Natives == nil {
		return ""
	}

	systemInfo := GetSystemInfo()
	classifier, ok := library.Natives[systemInfo.OS]
	if !ok {
		return ""
	}

	return strings.ReplaceAll(classifier, "${arch}", systemInfo.Arch)
}

func GetNativeArtifact(library models.Library) (models.DownloadInfo, bool) {
	classifier := GetNativeClassifier(library)
	if classifier == "" {
		return models.DownloadInfo{}, false
	}

	artifact, ok := library.Downloads.Classifiers[classifier]
	return artifact, ok
}
