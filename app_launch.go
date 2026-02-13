package main

import (
	"NezordLauncher/pkg/auth"
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/fabric"
	"NezordLauncher/pkg/instances"
	"NezordLauncher/pkg/javascanner"
	"NezordLauncher/pkg/launch"
	"NezordLauncher/pkg/models"
	"NezordLauncher/pkg/network"
	"NezordLauncher/pkg/quilt"
	"NezordLauncher/pkg/services"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

func (a *App) LaunchInstance(instanceID string) error {
	account := a.accountManager.GetActiveAccount()
	if account == nil {
		return fmt.Errorf("no active account selected")
	}

	inst, ok := a.instanceManager.Get(instanceID)
	if !ok {
		return fmt.Errorf("instance not found: %s", instanceID)
	}

	if err := a.downloadVersion(instanceID, inst.GameVersion); err != nil {
		return err
	}

	finalVersionID := inst.GetLaunchVersionID()

	if inst.ModloaderType == instances.ModloaderFabric {
		a.emitLaunchStatus(instanceID, "Verifying Fabric...")
		installedID, err := fabric.InstallFabric(inst.GameVersion, inst.ModloaderVersion)
		if err != nil {
			return fmt.Errorf("failed to install fabric: %w", err)
		}
		finalVersionID = installedID
	} else if inst.ModloaderType == instances.ModloaderQuilt {
		a.emitLaunchStatus(instanceID, "Verifying Quilt...")
		installedID, err := quilt.InstallQuilt(inst.GameVersion, inst.ModloaderVersion)
		if err != nil {
			return fmt.Errorf("failed to install quilt: %w", err)
		}
		finalVersionID = installedID
	}

	if finalVersionID != inst.GameVersion {
		if err := a.downloadVersion(instanceID, finalVersionID); err != nil {
			return err
		}
	}

	instanceDir := filepath.Join(constants.GetInstancesDir(), inst.ID, ".minecraft")
	if err := os.MkdirAll(instanceDir, 0755); err != nil {
		return fmt.Errorf("failed to create instance dir: %w", err)
	}

	nativesDir := filepath.Join(constants.GetInstancesDir(), inst.ID, "natives")

	a.emitLaunchStatus(instanceID, "Preparing environment...")

	version, err := a.getVersionDetails(finalVersionID)
	if err != nil {
		return fmt.Errorf("failed to get version details: %w", err)
	}

	settings := a.settingsManager.Get()

	javaPath := ""
	if inst.Settings.OverrideJava && inst.Settings.JavaPath != "" {
		a.emitLaunchStatus(instanceID, "Using custom Java from instance...")
		if _, err := os.Stat(inst.Settings.JavaPath); err == nil {
			javaPath = inst.Settings.JavaPath
		} else {
			a.emitLaunchError(instanceID, "JAVA_PATH_INSTANCE_INVALID", "Instance Java path invalid, falling back to settings or auto-detect", err)
		}
	}

	if javaPath == "" && settings.DefaultJavaPath != "" {
		a.emitLaunchStatus(instanceID, "Using Java from settings...")
		if _, err := os.Stat(settings.DefaultJavaPath); err == nil {
			javaPath = settings.DefaultJavaPath
		} else {
			a.emitLaunchError(instanceID, "JAVA_PATH_SETTINGS_INVALID", "Settings Java path invalid, falling back to auto-detect", err)
		}
	}

	if javaPath == "" {
		a.emitLaunchStatus(instanceID, "Scanning Java runtime...")
		javaInstalls, err := javascanner.ScanJavaInstallations()
		if err != nil {
			return fmt.Errorf("java scan failed: %w", err)
		}

		javaTargetVersion := finalVersionID
		if version.InheritsFrom != "" {
			javaTargetVersion = version.InheritsFrom
		}

		selectedJava, err := javascanner.SelectJava(javaInstalls, javaTargetVersion)
		if err != nil {
			return fmt.Errorf("java selection failed: %w", err)
		}
		javaPath = selectedJava.Path
		a.emitLaunchStatus(instanceID, fmt.Sprintf("Using Java: %s (%s)", selectedJava.Version, selectedJava.Path))
	}

	a.emitLaunchStatus(instanceID, "Extracting native libraries...")
	if err := launch.ExtractNatives(version.Libraries, nativesDir); err != nil {
		return fmt.Errorf("natives extraction failed: %w", err)
	}

	authlibPath := ""
	if account.Type == auth.AccountTypeElyBy {
		a.emitLaunchStatus(instanceID, "Verifying Authlib Injector...")
		path, err := services.EnsureAuthlibInjector()
		if err != nil {
			return fmt.Errorf("failed to ensure authlib injector: %w", err)
		}
		authlibPath = path
	}

	ramMB := inst.Settings.RamMB
	if ramMB == 0 {
		if settings.DefaultRamMB > 0 {
			ramMB = settings.DefaultRamMB
		} else {
			ramMB = 4096
		}
	}

	width := settings.DefaultResolutionW
	height := settings.DefaultResolutionH
	if width <= 0 {
		width = 854
	}
	if height <= 0 {
		height = 480
	}
	if inst.Settings.ResolutionW > 0 && inst.Settings.ResolutionH > 0 {
		width = inst.Settings.ResolutionW
		height = inst.Settings.ResolutionH
	}

	opts := launch.LaunchOptions{
		PlayerName:          account.Username,
		UUID:                account.UUID,
		AccessToken:         account.AccessToken,
		UserType:            string(account.Type),
		VersionID:           finalVersionID,
		GameDir:             instanceDir,
		AssetsDir:           constants.GetAssetsDir(),
		NativesDir:          nativesDir,
		RamMB:               ramMB,
		Width:               width,
		Height:              height,
		AuthlibInjectorPath: authlibPath,
	}
	if strings.EqualFold(settings.WindowMode, "Fullscreen") {
		opts.Fullscreen = true
	}
	if strings.EqualFold(settings.WindowMode, "Borderless") {
		opts.Borderless = true
	}

	args, err := launch.BuildArguments(version, opts)
	if err != nil {
		return fmt.Errorf("argument build failed: %w", err)
	}

	prefixArgs := []string{}
	if settings.DefaultJvmArgs != "" {
		prefixArgs = append(prefixArgs, settings.DefaultJvmArgs)
	}
	if inst.Settings.JvmArgs != "" {
		prefixArgs = append(prefixArgs, inst.Settings.JvmArgs)
	}
	if len(prefixArgs) > 0 {
		args = append(prefixArgs, args...)
	}

	a.emitLaunchStatus(instanceID, "Launching game process...")

	logCallback := func(text string) {
		a.emitGameLog(instanceID, text)
		fmt.Println(text)
	}

	// GPU Selection
	gpuPref := inst.Settings.GpuPreference
	if gpuPref == "" {
		gpuPref = settings.GpuPreference
	}
	if gpuPref == "" {
		gpuPref = "auto"
	}

	env := make(map[string]string)
	if gpuPref == "discrete" {
		if runtime.GOOS == "linux" {
			if a.hasNvidiaGPU() {
				a.emitLaunchStatus(instanceID, "Using Discrete GPU (NVIDIA detected)...")
				env["__NV_PRIME_RENDER_OFFLOAD"] = "1"
				env["__GLX_VENDOR_LIBRARY_NAME"] = "nvidia"
			} else {
				a.emitLaunchStatus(instanceID, "Using Discrete GPU (AMD/Mesa detected)...")
				env["DRI_PRIME"] = "1"
			}
		} else if runtime.GOOS == "windows" {
			a.emitLaunchStatus(instanceID, "Setting Windows Game Mode / High Performance...")
		}
	} else if gpuPref == "integrated" {
		a.emitLaunchStatus(instanceID, "Using Integrated GPU...")
		// For integrated, we simply do not set any offload variables.
		// This relies on the system default being the integrated GPU (standard behavior).
	} else {
		a.emitLaunchStatus(instanceID, "Using Auto GPU selection...")
	}

	if runtime.GOOS == "windows" {
		// On Windows, we set the registry key for the javaw.exe that will be used.
		// This persists, so we should set it every time just in case it was changed.
		if err := setWindowsGpuPreference(javaPath, gpuPref); err != nil {
			fmt.Printf("Failed to set Windows GPU preference: %v\n", err)
		}
	}

	finalCommand := javaPath
	finalArgs := args

	// Handle Wrapper Command
	wrapperCmd := inst.Settings.WrapperCommand
	if wrapperCmd == "" {
		wrapperCmd = settings.WrapperCommand
	}

	if wrapperCmd != "" {
		parts := strings.Fields(wrapperCmd)
		if len(parts) > 0 {
			a.emitLaunchStatus(instanceID, fmt.Sprintf("Using wrapper: %s", wrapperCmd))
			finalCommand = parts[0]
			// Wrapper args + Java Path + Java Args
			wrapperArgs := append(parts[1:], javaPath)
			finalArgs = append(wrapperArgs, args...)
		}
	}

	cmd, err := launch.Launch(finalCommand, finalArgs, instanceDir, env)
	if err != nil {
		a.emitLaunchError(instanceID, "LAUNCH_COMMAND_CREATE_FAILED", "Failed to prepare launch command", err)
		a.emitLaunchExit(instanceID, "error")
		return err
	}

	a.runningMu.Lock()
	a.runningInstances[instanceID] = cmd
	a.runningMu.Unlock()

	go func() {
		defer func() {
			a.runningMu.Lock()
			delete(a.runningInstances, instanceID)
			a.runningMu.Unlock()
			a.emitLaunchExit(instanceID, "success")
		}()

		if err := launch.Monitor(cmd, logCallback); err != nil {
			a.emitLaunchError(instanceID, "LAUNCH_RUNTIME_ERROR", "Game process exited with error", err)
		} else {
			a.emitLaunchStatus(instanceID, "Game closed successfully")
		}
	}()

	return nil
}

func (a *App) StopInstance(instanceID string) error {
	a.runningMu.Lock()
	cmd, ok := a.runningInstances[instanceID]
	a.runningMu.Unlock()

	if !ok {
		return fmt.Errorf("instance not running: %s", instanceID)
	}

	a.emitLaunchStatus(instanceID, "Stopping instance...")

	if err := launch.SendTerminate(cmd); err != nil {
		if cmd.Process != nil {
			return cmd.Process.Kill()
		}
		return err
	}

	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()
	timeout := time.After(5 * time.Second)

	for {
		select {
		case <-timeout:
			if cmd.Process != nil {
				a.emitLaunchStatus(instanceID, "Force stopping instance...")
				return cmd.Process.Kill()
			}
			return nil
		case <-ticker.C:
			a.runningMu.Lock()
			_, running := a.runningInstances[instanceID]
			a.runningMu.Unlock()
			if !running {
				return nil
			}
		}
	}
}

func (a *App) getVersionDetails(versionID string) (*models.VersionDetail, error) {
	localPath := filepath.Join(constants.GetVersionsDir(), versionID, fmt.Sprintf("%s.json", versionID))
	if _, err := os.Stat(localPath); err == nil {
		data, err := os.ReadFile(localPath)
		if err != nil {
			return nil, err
		}
		var child models.VersionDetail
		if err := json.Unmarshal(data, &child); err != nil {
			return nil, err
		}

		if child.InheritsFrom != "" {
			parent, err := a.fetchVanillaVersion(child.InheritsFrom)
			if err != nil {
				return nil, fmt.Errorf("failed to fetch parent %s: %w", child.InheritsFrom, err)
			}
			return launch.MergeVersions(&child, parent), nil
		}
		return &child, nil
	}

	return a.fetchVanillaVersion(versionID)
}

func (a *App) hasNvidiaGPU() bool {
	// Check for nvidia-smi command which indicates NVIDIA drivers are installed/active
	_, err := exec.LookPath("nvidia-smi")
	if err == nil {
		return true
	}

	// Fallback check: look for /proc/driver/nvidia existence
	if _, err := os.Stat("/proc/driver/nvidia"); err == nil {
		return true
	}

	return false
}

func (a *App) fetchVanillaVersion(versionID string) (*models.VersionDetail, error) {
	client := network.NewHttpClient()
	data, err := client.Get(constants.VersionManifestV2URL)
	if err != nil {
		return nil, err
	}

	var manifest models.VersionManifest
	if err := json.Unmarshal(data, &manifest); err != nil {
		return nil, err
	}

	targetURL := ""
	for _, v := range manifest.Versions {
		if v.ID == versionID {
			targetURL = v.URL
			break
		}
	}

	if targetURL == "" {
		return nil, fmt.Errorf("version %s not found", versionID)
	}

	detailData, err := client.Get(targetURL)
	if err != nil {
		return nil, err
	}

	var detail models.VersionDetail
	if err := json.Unmarshal(detailData, &detail); err != nil {
		return nil, err
	}
	return &detail, nil
}

func (a *App) emitLaunchStatus(instanceID, message string) {
	a.emit(eventLaunchStatus, newEventPayload("backend.launch", instanceID, "running", message))
}

func (a *App) emitLaunchError(instanceID, code, message string, err error) {
	payload := newEventPayload("backend.launch", instanceID, "failed", message)
	payload.Error = &EventError{
		Code:    code,
		Message: message,
	}
	if err != nil {
		payload.Error.Cause = err.Error()
	}
	a.emit(eventLaunchError, payload)
}

func (a *App) emitGameLog(instanceID, message string) {
	a.emit(eventLaunchGameLog, newEventPayload("backend.launch", instanceID, "running", message))
}

func (a *App) emitLaunchExit(instanceID, status string) {
	a.emit(eventLaunchExit, newEventPayload("backend.launch", instanceID, status, "Launch process exited"))
}
