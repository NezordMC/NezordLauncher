package javascanner

import (
	"fmt"
	"strconv"
	"strings"
)

func SelectJava(installations []JavaInstallation, mcVersion string) (*JavaInstallation, error) {
	if len(installations) == 0 {
		return nil, fmt.Errorf("no java installations found")
	}

	reqVersion := getRequiredJavaVersion(mcVersion)
	var bestMatch *JavaInstallation
	bestScore := -1

	for i := range installations {
		install := &installations[i]
		javaVer := parseMajorVersion(install.Version)
		score := calculateScore(javaVer, reqVersion, install.IsTemurin)

		if score > bestScore {
			bestScore = score
			bestMatch = install
		}
	}

	if bestMatch == nil || bestScore < 0 {
		return nil, fmt.Errorf("no compatible java version found for minecraft %s (requires java %d+)", mcVersion, reqVersion)
	}

	return bestMatch, nil
}

func getRequiredJavaVersion(mcVersion string) int {
	parts := strings.Split(mcVersion, ".")
	if len(parts) < 2 {
		return 8 
	}

	major, _ := strconv.Atoi(parts[0]) 
	minor, _ := strconv.Atoi(parts[1])
	patch := 0
	if len(parts) > 2 {
		patch, _ = strconv.Atoi(parts[2])
	}

	if major == 1 {
		if minor > 20 {
			return 21 
		}
		if minor == 20 {
			if patch >= 5 {
				return 21
			}
			return 17
		}
		if minor >= 17 {
			return 17
		}
	}

	return 8
}

func parseMajorVersion(versionStr string) int {
	parts := strings.Split(versionStr, ".")
	if len(parts) > 0 {
		ver, _ := strconv.Atoi(parts[0])
		if ver == 1 && len(parts) > 1 {
			ver, _ = strconv.Atoi(parts[1])
		}
		return ver
	}
	return 0
}

func calculateScore(javaVer, reqVer int, isTemurin bool) int {
	if javaVer < reqVer {
		return -1 
	}

	score := 0

	if javaVer == reqVer {
		score += 100 
	} else {
		score += 50 
	}

	if isTemurin {
		score += 10 
	}

	return score
}
