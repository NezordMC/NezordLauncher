package javascanner

import (
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

	for _, p := range paths {
		if info, err := checkJava(p); err == nil {
			
			found := false
			for _, existing := range installs {
				if existing.Path == info.Path {
					found = true
					break
				}
			}
			if !found {
				installs = append(installs, *info)
			}
		}
	}

	return installs, nil
}

func getCandidatePaths() []string {
	var paths []string

	
	if home := os.Getenv("JAVA_HOME"); home != "" {
		bin := filepath.Join(home, "bin", "java")
		if runtime.GOOS == "windows" {
			bin += ".exe"
		}
		paths = append(paths, bin)
	}

	
	pathVar := os.Getenv("PATH")
	separator := ":"
	if runtime.GOOS == "windows" {
		separator = ";"
	}
	
	for _, dir := range strings.Split(pathVar, separator) {
		bin := filepath.Join(dir, "java")
		if runtime.GOOS == "windows" {
			bin += ".exe"
		}
		if _, err := os.Stat(bin); err == nil {
			paths = append(paths, bin)
		}
	}

	
	if runtime.GOOS == "linux" {
		common := []string{
			"/usr/bin/java",
			"/usr/lib/jvm",
		}
		for _, c := range common {
			if info, err := os.Stat(c); err == nil {
				if !info.IsDir() {
					paths = append(paths, c)
				} else {
					
					entries, _ := os.ReadDir(c)
					for _, e := range entries {
						bin := filepath.Join(c, e.Name(), "bin", "java")
						if _, err := os.Stat(bin); err == nil {
							paths = append(paths, bin)
						}
					}
				}
			}
		}
	}
	
	
	if runtime.GOOS == "windows" {
		
		progFiles := []string{os.Getenv("ProgramFiles"), os.Getenv("ProgramFiles(x86)")}
		for _, pf := range progFiles {
			if pf == "" { continue }
			javaDir := filepath.Join(pf, "Java")
			entries, _ := os.ReadDir(javaDir)
			for _, e := range entries {
				bin := filepath.Join(javaDir, e.Name(), "bin", "java.exe")
				if _, err := os.Stat(bin); err == nil {
					paths = append(paths, bin)
				}
			}
			
			eclipseDir := filepath.Join(pf, "Eclipse Foundation")
			entries2, _ := os.ReadDir(eclipseDir)
			for _, e := range entries2 {
				bin := filepath.Join(eclipseDir, e.Name(), "bin", "java.exe")
				if _, err := os.Stat(bin); err == nil {
					paths = append(paths, bin)
				}
			}
		}
	}

	return paths
}

func checkJava(path string) (*JavaInfo, error) {
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
