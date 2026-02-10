package instances

import (
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/downloader"
	"NezordLauncher/pkg/models"
	"NezordLauncher/pkg/system"
	"fmt"
	"os"
	"path/filepath"
)

type VerificationResult struct {
	File   string `json:"file"`
	Status string `json:"status"` // "missing", "corrupt", "ok"
}

func VerifyInstance(version *models.VersionDetail) ([]VerificationResult, error) {
	var results []VerificationResult
	sysInfo := system.GetSystemInfo()
	libDir := constants.GetLibrariesDir()

	for _, lib := range version.Libraries {
		if !lib.IsAllowed(sysInfo.OS) {
			continue
		}

		path := lib.Downloads.Artifact.GetPath()
		if path == "" {
			path = lib.GetMavenPath()
		}

		if path == "" {
			continue
		}

		fullPath := filepath.Join(libDir, path)
		sha1 := lib.Downloads.Artifact.SHA1

		status := "ok"
		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			status = "missing"
		} else if sha1 != "" {
			valid, err := downloader.VerifyFileSHA1(fullPath, sha1)
			if err != nil || !valid {
				status = "corrupt"
			}
		}

		if status != "ok" {
			results = append(results, VerificationResult{
				File:   path,
				Status: status,
			})
		}
	}

	jarID := version.ID
	if version.Jar != "" {
		jarID = version.Jar
	}
	
	clientJar := filepath.Join(constants.GetVersionsDir(), jarID, fmt.Sprintf("%s.jar", jarID))
	// Verification logic for client jar (SHA1 might be in version detail if available, usually handled by download info)
	// For now, checks existence
	if _, err := os.Stat(clientJar); os.IsNotExist(err) {
		results = append(results, VerificationResult{
			File:   filepath.Base(clientJar),
			Status: "missing",
		})
	}

	return results, nil
}
