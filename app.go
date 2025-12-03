package main

import (
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/downloader"
	"NezordLauncher/pkg/system"
	"context"
	"fmt"
	"os"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
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
			err := os.MkdirAll(dir, 0755)
			if err != nil {
				fmt.Printf("Failed to create directory: %s\n", err)
			}
		}
	}
}

func (a *App) GetSystemPlatform() system.SystemInfo {
	return system.GetSystemInfo()
}

func (a *App) DownloadVersion(versionID string) error {
	pool := downloader.NewWorkerPool(10, 100)
	pool.Start()
	
	fetcher := downloader.NewArtifactFetcher(pool)
	
	fmt.Printf("Starting download for version: %s\n", versionID)
	
	if err := fetcher.DownloadVersion(versionID); err != nil {
		pool.Wait() 
		return fmt.Errorf("download failed: %w", err)
	}

	pool.Wait()
	fmt.Printf("Download completed successfully for: %s\n", versionID)
	return nil
}
