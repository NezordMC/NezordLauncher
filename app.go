package main

import (
	"context"
	"fmt"
	"os"
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/system"
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
