package system

import (
	"NezordLauncher/pkg/models"
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