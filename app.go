package main

import (
	"context"
	"encoding/json"
	"fmt"
	"NezordLauncher/pkg/auth"
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/downloader"
	"NezordLauncher/pkg/javascanner"
	"NezordLauncher/pkg/launch"
	"NezordLauncher/pkg/models"
	"NezordLauncher/pkg/network"
	"NezordLauncher/pkg/services"
	"NezordLauncher/pkg/system"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx            context.Context
	isTestMode     bool
	accountManager *auth.AccountManager
}

func NewApp() *App {
	return &App{
		accountManager: auth.NewAccountManager(),
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
}

func (a *App) GetAccounts() []auth.Account {
	return a.accountManager.GetAccounts()
}

func (a *App) AddOfflineAccount(username string) (*auth.Account, error) {
	return a.accountManager.AddOfflineAccount(username)
}

func (a *App) SetActiveAccount(uuid string) error {
	return a.accountManager.SetActiveAccount(uuid)
}

func (a *App) GetActiveAccount() *auth.Account {
	return a.accountManager.GetActiveAccount()
}

func (a *App) GetSystemPlatform() system.SystemInfo {
	return system.GetSystemInfo()
}

func (a *App) DownloadVersion(versionID string) error {
	pool := downloader.NewWorkerPool(10, 100)
	pool.Start()
	
	fetcher := downloader.NewArtifactFetcher(pool)
	
	a.emit("downloadStatus", fmt.Sprintf("Starting download for version: %s", versionID))
	
	if err := fetcher.DownloadVersion(versionID); err != nil {
		pool.Wait() 
		return fmt.Errorf("download failed: %w", err)
	}

	pool.Wait()
	a.emit("downloadStatus", "Download completed successfully")
	return nil
}

func (a *App) LaunchGame(versionID string, ramMB int) error {
	account := a.accountManager.GetActiveAccount()
	if account == nil {
		return fmt.Errorf("no active account selected")
	}

	instanceDir := filepath.Join(constants.GetInstancesDir(), versionID)
	nativesDir := filepath.Join(instanceDir, "natives")
	
	a.emit("launchStatus", "Preparing environment...")

	version, err := a.getVersionDetails(versionID)
	if err != nil {
		return fmt.Errorf("failed to get version details: %w", err)
	}

	a.emit("launchStatus", "Selecting Java runtime...")
	javaInstalls, err := javascanner.ScanJavaInstallations()
	if err != nil {
		return fmt.Errorf("java scan failed: %w", err)
	}
	
	selectedJava, err := javascanner.SelectJava(javaInstalls, versionID)
	if err != nil {
		return fmt.Errorf("java selection failed: %w", err)
	}
	a.emit("launchStatus", fmt.Sprintf("Using Java: %s (%s)", selectedJava.Version, selectedJava.Path))

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
		a.emit("launchStatus", "Authlib Injector ready")
	}

	opts := launch.LaunchOptions{
		PlayerName:          account.Username,
		UUID:                account.UUID,
		AccessToken:         account.AccessToken,
		UserType:            string(account.Type),
		VersionID:           versionID,
		GameDir:             instanceDir,
		AssetsDir:           constants.GetAssetsDir(),
		NativesDir:          nativesDir,
		RamMB:               ramMB,
		Width:               854,
		Height:              480,
		AuthlibInjectorPath: authlibPath,
	}

	args, err := launch.BuildArguments(version, opts)
	if err != nil {
		return fmt.Errorf("argument build failed: %w", err)
	}

	a.emit("launchStatus", "Launching game process...")
	
	logCallback := func(text string) {
		a.emit("gameLog", text)
		fmt.Println(text) 
	}

	go func() {
		if err := launch.ExecuteGame(selectedJava.Path, args, instanceDir, logCallback); err != nil {
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
