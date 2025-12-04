package javascanner

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
)

type JavaInstallation struct {
	Path      string
	Version   string
	Vendor    string
	IsTemurin bool
}

func ScanJavaInstallations() ([]JavaInstallation, error) {
	var installations []JavaInstallation
	
	searchPaths := []string{
		"/usr/lib/jvm",
		"/opt/java",
		"/usr/java",
	}

	for _, searchPath := range searchPaths {
		entries, err := os.ReadDir(searchPath)
		if err != nil {
			continue
		}

		for _, entry := range entries {
			if !entry.IsDir() {
				continue
			}

			fullPath := filepath.Join(searchPath, entry.Name())
			javaBin := filepath.Join(fullPath, "bin", "java")

			if _, err := os.Stat(javaBin); err == nil {
				if install, err := validateJavaBinary(javaBin); err == nil {
					installations = append(installations, install)
				}
			}
		}
	}

	systemJava, err := exec.LookPath("java")
	if err == nil {
		if install, err := validateJavaBinary(systemJava); err == nil {
			isDuplicate := false
			for _, existing := range installations {
				if existing.Path == install.Path {
					isDuplicate = true
					break
				}
			}
			if !isDuplicate {
				installations = append(installations, install)
			}
		}
	}

	return installations, nil
}

func validateJavaBinary(path string) (JavaInstallation, error) {
	cmd := exec.Command(path, "-version")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return JavaInstallation{}, fmt.Errorf("failed to execute java binary: %w", err)
	}

	versionStr := string(output)
	version := parseJavaVersion(versionStr)
	vendor := "Unknown"
	isTemurin := false

	if strings.Contains(strings.ToLower(versionStr), "temurin") || strings.Contains(strings.ToLower(versionStr), "adoptium") {
		vendor = "Eclipse Temurin"
		isTemurin = true
	} else if strings.Contains(strings.ToLower(versionStr), "openjdk") {
		vendor = "OpenJDK"
	} else if strings.Contains(strings.ToLower(versionStr), "oracle") {
		vendor = "Oracle"
	}

	return JavaInstallation{
		Path:      path,
		Version:   version,
		Vendor:    vendor,
		IsTemurin: isTemurin,
	}, nil
}

func parseJavaVersion(output string) string {
	re := regexp.MustCompile(`version "([^"]+)"`)
	matches := re.FindStringSubmatch(output)
	if len(matches) > 1 {
		return matches[1]
	}
	
	reSimple := regexp.MustCompile(` ([\d\.]+) `)
	matchesSimple := reSimple.FindStringSubmatch(output)
	if len(matchesSimple) > 1 {
		return matchesSimple[1]
	}

	return "unknown"
}
