package main

import (
	"NezordLauncher/pkg/auth"
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/downloader"
	"NezordLauncher/pkg/fabric"
	"NezordLauncher/pkg/instances"
	"NezordLauncher/pkg/javascanner"
	"NezordLauncher/pkg/launch"
	"NezordLauncher/pkg/models"
	"NezordLauncher/pkg/network"
	"NezordLauncher/pkg/quilt"
	"NezordLauncher/pkg/services"
	"NezordLauncher/pkg/settings"
	"NezordLauncher/pkg/system"
	"NezordLauncher/pkg/validation"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx             context.Context
	isTestMode      bool
	accountManager  *auth.AccountManager
	instanceManager *instances.Manager
	settingsManager *settings.Manager
	
	downloadCancel context.CancelFunc
	downloadMu     sync.Mutex
}

func NewApp() *App {
	return &App{
		accountManager:  auth.NewAccountManager(),
		instanceManager: instances.NewManager(),
		settingsManager: settings.NewManager(),
	}
}

func (a *App) EnableTestMode() {
	a.isTestMode = true
}

func (a *App) emit(eventName string, data ...interface{}) {
	if a.isTestMode {
		if len(data) > 0 {
			fmt.Printf("[EVENT: %s] %v\n", eventName, data[0])
		} else {
			fmt.Printf("[EVENT: %s]\n", eventName)
		}
		return
	}
	runtime.EventsEmit(a.ctx, eventName, data...)
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	
	dirs := []string{
		constants.GetAppDataDir(),
		constants.GetInstancesDir(),
		constants.GetAssetsDir(),
		constants.GetLibrariesDir(),
		constants.GetRuntimesDir(),
		constants.GetVersionsDir(),
	}

	for _, dir := range dirs {
		if _, err := os.Stat(dir); os.IsNotExist(err) {
			if err := os.MkdirAll(dir, 0755); err != nil {
				fmt.Printf("Failed to create directory: %s\n", err)
			}
		}
	}

	if err := a.accountManager.Load(); err != nil {
		fmt.Printf("Failed to load accounts: %s\n", err)
	}

	if err := a.instanceManager.Load(); err != nil {
		fmt.Printf("Failed to load instances: %s\n", err)
	}

	if err := a.settingsManager.Load(); err != nil {
		fmt.Printf("Failed to load settings: %s\n", err)
	}
}

func (a *App) GetVanillaVersions() ([]models.Version, error) {
	client := network.NewHttpClient()
	data, err := client.Get(constants.VersionManifestV2URL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch manifest: %w", err)
	}

	var manifest models.VersionManifest
	if err := json.Unmarshal(data, &manifest); err != nil {
		return nil, fmt.Errorf("failed to parse manifest: %w", err)
	}

	var releases []models.Version
	for _, v := range manifest.Versions {
		if v.Type == "release" {
			releases = append(releases, v)
		}
	}

	return releases, nil
}

func (a *App) GetFabricLoaders(mcVersion string) ([]string, error) {
	loaders, err := fabric.GetLoaderVersions(mcVersion)
	if err != nil {
		return nil, err
	}
	
	var versions []string
	for _, l := range loaders {
		versions = append(versions, l.Loader.Version)
	}
	return versions, nil
}

func (a *App) GetQuiltLoaders(mcVersion string) ([]string, error) {
	loaders, err := quilt.GetLoaderVersions(mcVersion)
	if err != nil {
		return nil, err
	}
	
	var versions []string
	for _, l := range loaders {
		versions = append(versions, l.Loader.Version)
	}
	return versions, nil
}

func (a *App) GetAccounts() []auth.Account {
	return a.accountManager.GetAccounts()
}

func (a *App) AddOfflineAccount(username string) (*auth.Account, error) {
	if err := validation.ValidateUsername(username); err != nil {
		return nil, err
	}
	return a.accountManager.AddOfflineAccount(username)
}

func (a *App) LoginElyBy(username, password string) (*auth.Account, error) {
	if username == "" || password == "" {
		return nil, fmt.Errorf("username and password required")
	}
	return a.accountManager.AddElyByAccount(username, password)
}

func (a *App) SetActiveAccount(uuid string) error {
	if err := validation.ValidateUUID(uuid); err != nil {
		return err
	}
	return a.accountManager.SetActiveAccount(uuid)
}

func (a *App) GetActiveAccount() *auth.Account {
	return a.accountManager.GetActiveAccount()
}

func (a *App) CreateInstance(name, gameVersion, modloaderType, modloaderVersion string) (*instances.Instance, error) {
	if err := validation.ValidateInstanceName(name); err != nil {
		return nil, err
	}
	if err := validation.ValidateVersionID(gameVersion); err != nil {
		return nil, err
	}
	return a.instanceManager.CreateInstance(name, gameVersion, instances.ModloaderType(modloaderType), modloaderVersion)
}

func (a *App) GetInstances() []instances.Instance {
	return a.instanceManager.GetAll()
}

func (a *App) DeleteInstance(id string) error {
	return a.instanceManager.DeleteInstance(id)
}

func (a *App) UpdateInstanceSettings(id string, settings instances.InstanceSettings) error {
	return a.instanceManager.UpdateSettings(id, settings)
}

func (a *App) GetSystemPlatform() system.SystemInfo {
	return system.GetSystemInfo()
}

func (a *App) GetSettings() settings.LauncherSettings {
	return a.settingsManager.Get()
}

func (a *App) UpdateGlobalSettings(s settings.LauncherSettings) error {
	return a.settingsManager.Update(s)
}

func (a *App) ScanJavaInstallations() ([]javascanner.JavaInfo, error) {
	return javascanner.ScanJavaInstallations()
}

func (a *App) OpenInstanceFolder(instanceID string) error {
	inst, ok := a.instanceManager.Get(instanceID)
	if !ok {
		return fmt.Errorf("instance not found: %s", instanceID)
	}
	instanceDir := filepath.Join(constants.GetInstancesDir(), inst.ID, ".minecraft")
	if err := os.MkdirAll(instanceDir, 0755); err != nil {
		return fmt.Errorf("failed to create instance dir: %w", err)
	}
	cmd := exec.Command("xdg-open", instanceDir)
	return cmd.Start()
}

func (a *App) StartInstanceDownload(instanceID string) error {
	inst, ok := a.instanceManager.Get(instanceID)
	if !ok {
		return fmt.Errorf("instance not found: %s", instanceID)
	}
	return a.DownloadVersion(inst.GameVersion)
}

func (a *App) DownloadVersion(versionID string) error {
	if err := validation.ValidateVersionID(versionID); err != nil {
		return err
	}
	a.downloadMu.Lock()
	if a.downloadCancel != nil {
		a.downloadCancel()
	}
	ctx, cancel := context.WithCancel(context.Background())
	a.downloadCancel = cancel
	a.downloadMu.Unlock()

	defer func() {
		a.downloadMu.Lock()
		if a.downloadCancel != nil {
			a.downloadCancel()
			a.downloadCancel = nil
		}
		a.downloadMu.Unlock()
	}()

	pool := downloader.NewWorkerPool(10, 100)
	
	totalAssets := 0
	
	versionDetail, _ := a.getVersionDetails(versionID) 
	if versionDetail != nil {
		totalAssets = len(versionDetail.Libraries) + 1 
		if versionDetail.AssetIndex.ID != "" {
			totalAssets += 1000 
		}
		pool.Progress = downloader.NewProgress(totalAssets)
	}

	pool.Start(ctx)
	fetcher := downloader.NewArtifactFetcher(pool)
	
	a.emit("downloadStatus", fmt.Sprintf("Starting download for: %s", versionID))
	
	progressTicker := time.NewTicker(100 * time.Millisecond)
	go func() {
		for {
			select {
			case <-progressTicker.C:
				current, total := pool.Progress.GetCounts()
				a.emit("downloadProgress", fmt.Sprintf("%d/%d", current, total))
			case <-ctx.Done():
				progressTicker.Stop()
				return
			}
		}
	}()

	if err := fetcher.DownloadVersion(ctx, versionID); err != nil {
		pool.Wait() 
		progressTicker.Stop()
		if err == context.Canceled {
			a.emit("downloadStatus", "Download cancelled")
			return fmt.Errorf("cancelled")
		}
		return fmt.Errorf("download failed: %w", err)
	}

	pool.Wait()
	progressTicker.Stop()
	a.emit("downloadStatus", "Artifacts verification complete")
	return nil
}

func (a *App) CancelDownload() {
	a.downloadMu.Lock()
	defer a.downloadMu.Unlock()
	if a.downloadCancel != nil {
		a.downloadCancel()
		a.emit("downloadStatus", "Stopping...")
	}
}

func (a *App) LaunchInstance(instanceID string) error {
	account := a.accountManager.GetActiveAccount()
	if account == nil {
		return fmt.Errorf("no active account selected")
	}

	inst, ok := a.instanceManager.Get(instanceID)
	if !ok {
		return fmt.Errorf("instance not found: %s", instanceID)
	}

	a.instanceManager.UpdatePlayTime(instanceID, 0)

	if err := a.DownloadVersion(inst.GameVersion); err != nil {
		return err
	}

	finalVersionID := inst.GetLaunchVersionID()
	
	if inst.ModloaderType == instances.ModloaderFabric {
		a.emit("launchStatus", "Verifying Fabric...")
		installedID, err := fabric.InstallFabric(inst.GameVersion, inst.ModloaderVersion)
		if err != nil {
			return fmt.Errorf("failed to install fabric: %w", err)
		}
		finalVersionID = installedID
	} else if inst.ModloaderType == instances.ModloaderQuilt {
		a.emit("launchStatus", "Verifying Quilt...")
		installedID, err := quilt.InstallQuilt(inst.GameVersion, inst.ModloaderVersion)
		if err != nil {
			return fmt.Errorf("failed to install quilt: %w", err)
		}
		finalVersionID = installedID
	}

	if finalVersionID != inst.GameVersion {
		if err := a.DownloadVersion(finalVersionID); err != nil {
			return err
		}
	}

	instanceDir := filepath.Join(constants.GetInstancesDir(), inst.ID, ".minecraft")
	if err := os.MkdirAll(instanceDir, 0755); err != nil {
		return fmt.Errorf("failed to create instance dir: %w", err)
	}

	nativesDir := filepath.Join(constants.GetInstancesDir(), inst.ID, "natives")
	
	a.emit("launchStatus", "Preparing environment...")

	version, err := a.getVersionDetails(finalVersionID)
	if err != nil {
		return fmt.Errorf("failed to get version details: %w", err)
	}

	javaPath := ""
	if inst.Settings.OverrideJava && inst.Settings.JavaPath != "" {
		a.emit("launchStatus", "Using custom Java...")
		if _, err := os.Stat(inst.Settings.JavaPath); err == nil {
			javaPath = inst.Settings.JavaPath
		} else {
			a.emit("launchError", "Custom Java path invalid, falling back to auto-detect")
		}
	}

	if javaPath == "" {
		a.emit("launchStatus", "Scanning Java runtime...")
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
		a.emit("launchStatus", fmt.Sprintf("Using Java: %s (%s)", selectedJava.Version, selectedJava.Path))
	}

	a.emit("launchStatus", "Extracting native libraries...")
	if err := launch.ExtractNatives(version.Libraries, nativesDir); err != nil {
		return fmt.Errorf("natives extraction failed: %w", err)
	}

	authlibPath := ""
	if account.Type == auth.AccountTypeElyBy {
		a.emit("launchStatus", "Verifying Authlib Injector...")
		path, err := services.EnsureAuthlibInjector()
		if err != nil {
			return fmt.Errorf("failed to ensure authlib injector: %w", err)
		}
		authlibPath = path
	}

	ramMB := inst.Settings.RamMB
	if ramMB == 0 {
		ramMB = 4096 
	}

	width := 854
	height := 480
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

	args, err := launch.BuildArguments(version, opts)
	if err != nil {
		return fmt.Errorf("argument build failed: %w", err)
	}

	if inst.Settings.JvmArgs != "" {
		args = append([]string{inst.Settings.JvmArgs}, args...)
	}

	a.emit("launchStatus", "Launching game process...")
	
	logCallback := func(text string) {
		a.emit("gameLog", text)
		fmt.Println(text) 
	}

	go func() {
		if err := launch.ExecuteGame(javaPath, args, instanceDir, logCallback); err != nil {
			a.emit("launchError", err.Error())
		} else {
			a.emit("launchStatus", "Game closed successfully")
		}
	}()

	return nil
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
