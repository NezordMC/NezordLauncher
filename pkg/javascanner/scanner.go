package javascanner

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strconv"
	"strings"
)

type JavaInfo struct {
	Path    string `json:"path"`
	Version string `json:"version"`
	Major   int    `json:"major"`
}

func ScanJavaInstallations() ([]JavaInfo, error) {
	var installs []JavaInfo
	paths := getCandidatePaths()
	seen := map[string]struct{}{}

	for _, p := range paths {
		if info, err := CheckJava(p); err == nil {
			if info == nil {
				continue
			}
			if _, ok := seen[info.Path]; ok {
				continue
			}
			seen[info.Path] = struct{}{}
			installs = append(installs, *info)
		}
	}

	return installs, nil
}

func getCandidatePaths() []string {
	var paths []string
	seen := map[string]struct{}{}

	if home := os.Getenv("JAVA_HOME"); home != "" {
		bin := filepath.Join(home, "bin", "java")
		if runtime.GOOS == "windows" {
			bin += ".exe"
		}
		addPath(&paths, seen, bin)
	}

	pathVar := os.Getenv("PATH")
	for _, dir := range strings.Split(pathVar, string(os.PathListSeparator)) {
		bin := filepath.Join(dir, "java")
		if runtime.GOOS == "windows" {
			bin += ".exe"
		}
		addIfFile(&paths, seen, bin)
	}

	if runtime.GOOS == "linux" {
		addIfFile(&paths, seen, "/usr/bin/java")
		addIfFile(&paths, seen, "/snap/bin/java")

		for _, alt := range listUpdateAlternatives() {
			addIfFile(&paths, seen, alt)
		}

		roots := []string{
			"/usr/lib/jvm",
			"/usr/lib64/jvm",
			"/usr/java",
			"/opt/java",
			"/opt/jdk",
			"/opt",
			"/usr/local/java",
			"/usr/local/jdk",
		}
		for _, root := range roots {
			addJavaFromRoot(&paths, seen, root)
		}
	}

	if runtime.GOOS == "windows" {
		// Common installation directories
		progFiles := []string{
			os.Getenv("ProgramFiles"),
			os.Getenv("ProgramFiles(x86)"),
		}

		bases := []string{"Java", "Eclipse Foundation", "Microsoft"}
		if localAppData := os.Getenv("LOCALAPPDATA"); localAppData != "" {
			progFiles = append(progFiles, filepath.Join(localAppData, "Programs"))
		}

		for _, pf := range progFiles {
			if pf == "" {
				continue
			}
			for _, base := range bases {
				targetDir := filepath.Join(pf, base)
				if _, err := os.Stat(targetDir); err == nil {
					addJavaFromRoot(&paths, seen, targetDir)
				}
			}
		}

		// Registry Scan
		regPaths, err := scanRegistryJava()
		if err == nil {
			for _, p := range regPaths {
				addIfFile(&paths, seen, filepath.Join(p, "bin", "java.exe"))
			}
		}
	}

	return paths
}

func CheckJava(path string) (*JavaInfo, error) {
	if path == "" {
		return nil, fmt.Errorf("empty path")
	}
	info, err := os.Stat(path)
	if err != nil || info.IsDir() {
		return nil, err
	}
	realPath, err := filepath.EvalSymlinks(path)
	if err == nil && realPath != "" {
		path = realPath
	}
	cmd := exec.Command(path, "-version")
	out, err := cmd.CombinedOutput()
	if err != nil {
		return nil, err
	}

	version := parseJavaVersion(string(out))
	if version == "" {
		return nil, nil
	}

	major := parseMajorVersion(version)

	return &JavaInfo{
		Path:    path,
		Version: version,
		Major:   major,
	}, nil
}

func parseJavaVersion(output string) string {
	re := regexp.MustCompile(`version "([^"]+)"`)
	matches := re.FindStringSubmatch(output)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}

func parseMajorVersion(version string) int {
	parts := strings.Split(version, ".")
	if len(parts) > 0 {
		if parts[0] == "1" && len(parts) > 1 {
			v, _ := strconv.Atoi(parts[1])
			return v
		}

		v, _ := strconv.Atoi(parts[0])
		return v
	}
	return 0
}

func listUpdateAlternatives() []string {
	cmd := exec.Command("update-alternatives", "--list", "java")
	out, err := cmd.Output()
	if err != nil {
		return nil
	}
	lines := strings.Split(string(out), "\n")
	var results []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		results = append(results, line)
	}
	return results
}

func addPath(paths *[]string, seen map[string]struct{}, path string) {
	if path == "" {
		return
	}
	if _, ok := seen[path]; ok {
		return
	}
	seen[path] = struct{}{}
	*paths = append(*paths, path)
}

func addIfFile(paths *[]string, seen map[string]struct{}, path string) {
	info, err := os.Stat(path)
	if err != nil || info.IsDir() {
		return
	}
	addPath(paths, seen, path)
}

func addJavaFromRoot(paths *[]string, seen map[string]struct{}, root string) {
	info, err := os.Stat(root)
	if err != nil {
		return
	}
	if !info.IsDir() {
		addIfFile(paths, seen, root)
		return
	}
	entries, err := os.ReadDir(root)
	if err != nil {
		return
	}
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		base := filepath.Join(root, e.Name())
		addIfFile(paths, seen, filepath.Join(base, "bin", "java"))
		addIfFile(paths, seen, filepath.Join(base, "jre", "bin", "java"))
	}
}
