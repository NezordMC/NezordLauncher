package launch

import (
	"fmt"
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/models"
	"NezordLauncher/pkg/system"
	"path/filepath"
	"strings"
)

type LaunchOptions struct {
	PlayerName   string
	UUID         string
	AccessToken  string
	UserType     string
	VersionID    string
	GameDir      string
	AssetsDir    string
	NativesDir   string
	RamMB        int
	Width        int
	Height       int
}

func BuildArguments(version *models.VersionDetail, options LaunchOptions) ([]string, error) {
	// Build Classpath (Library List)
	classpath, err := buildClasspath(version)
	if err != nil {
		return nil, err
	}

	// Prepare Variables for Substitution
	vars := map[string]string{
		"${auth_player_name}":  options.PlayerName,
		"${auth_uuid}":         options.UUID,
		"${auth_access_token}": options.AccessToken,
		"${user_type}":         options.UserType,
		"${version_name}":      options.VersionID,
		"${game_directory}":    options.GameDir,
		"${assets_root}":       options.AssetsDir,
		"${assets_index_name}": version.AssetIndex.ID,
		"${auth_xuid}":         options.AccessToken, // For Microsoft Auth compatibility
		"${clientid}":          options.AccessToken, // For Microsoft Auth compatibility
		"${version_type}":      version.Type,
		"${natives_directory}": options.NativesDir,
		"${launcher_name}":     constants.AppName,
		"${launcher_version}":  "1.0.0",
		"${classpath}":         classpath,
	}

	var args []string

	// Default JVM Args (Memory & Natives)
	args = append(args, fmt.Sprintf("-Xmx%dM", options.RamMB))
	args = append(args, fmt.Sprintf("-Djava.library.path=%s", options.NativesDir))

	// Modern JVM Args (1.13+)
	if len(version.Arguments.JVM) > 0 {
		for _, arg := range version.Arguments.JVM {
			if checkRules(arg.Rules) {
				for _, val := range arg.Values {
					args = append(args, replaceVars(val, vars))
				}
			}
		}
	} else {
		// Legacy Fallback for JVM Args (Standard behavior)
		args = append(args, "-cp", classpath)
	}

	args = append(args, version.MainClass)

	// Construct Game Arguments
	if len(version.Arguments.Game) > 0 {
		// Modern Game Args (1.13+)
		for _, arg := range version.Arguments.Game {
			if checkRules(arg.Rules) {
				for _, val := range arg.Values {
					args = append(args, replaceVars(val, vars))
				}
			}
		}
	} else {
		// Legacy Game Args (<1.13)
		legacyArgs := strings.Split(version.MinecraftArguments, " ")
		for _, arg := range legacyArgs {
			args = append(args, replaceVars(arg, vars))
		}
	}

	// Add Resolution Args manually if not present (Safety net)
	// Some versions rely on this being passed explicitly if not in arguments
	hasWidth := false
	for _, a := range args {
		if strings.Contains(a, "--width") {
			hasWidth = true
			break
		}
	}
	if !hasWidth && options.Width > 0 && options.Height > 0 {
		args = append(args, "--width", fmt.Sprintf("%d", options.Width))
		args = append(args, "--height", fmt.Sprintf("%d", options.Height))
	}

	return args, nil
}

func buildClasspath(version *models.VersionDetail) (string, error) {
	var paths []string
	libDir := constants.GetLibrariesDir()
	sysInfo := system.GetSystemInfo()

	// Add Libraries
	for _, lib := range version.Libraries {
		if !lib.IsAllowed(sysInfo.OS) {
			continue
		}
		
		path := lib.Downloads.Artifact.GetPath()
		if path == "" {
			continue 
		}
		
		fullPath := filepath.Join(libDir, path)
		paths = append(paths, fullPath)
	}

	// Add Client JAR (Minecraft itself)
	jarID := version.ID
    if version.Jar != "" {
        jarID = version.Jar
    }
    
    clientJar := filepath.Join(constants.GetInstancesDir(), jarID, fmt.Sprintf("%s.jar", jarID))
    paths = append(paths, clientJar)

	return strings.Join(paths, system.GetClasspathSeparator()), nil
}

func checkRules(rules []models.Rule) bool {
	if len(rules) == 0 {
		return true
	}
	
	sysInfo := system.GetSystemInfo()
	allowed := false
	
	for _, rule := range rules {
		isAllow := rule.Action == "allow"
		
		if rule.OS.Name == "" {
			allowed = isAllow
			continue
		}
		
		// Handle specific OS matches (osx, linux, windows)
		// Note: system.GetSystemInfo returns normalized (linux, osx, windows)
		match := rule.OS.Name == sysInfo.OS
		
		// Specific case for macOS sometimes referred as "osx" in older JSONs
		if rule.OS.Name == "osx" && sysInfo.OS == "darwin" {
			match = true
		}

		if match {
			allowed = isAllow
		}
	}
	return allowed
}

func replaceVars(str string, vars map[string]string) string {
	for k, v := range vars {
		str = strings.ReplaceAll(str, k, v)
	}
	return str
}
