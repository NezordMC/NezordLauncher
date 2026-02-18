package main

import (
	"NezordLauncher/pkg/auth"
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/instances"
	"NezordLauncher/pkg/ipc"
	"NezordLauncher/pkg/logging"
	"NezordLauncher/pkg/settings"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"

	wailsRun "github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx             context.Context
	isTestMode      bool
	accountManager  *auth.AccountManager
	instanceManager *instances.Manager
	settingsManager *settings.Manager

	downloadCancel context.CancelFunc
	downloadMu     sync.Mutex

	runningInstances map[string]*exec.Cmd
	runningMu        sync.Mutex
}

type UpdateCheck struct {
	CurrentVersion  string `json:"currentVersion"`
	LatestVersion   string `json:"latestVersion"`
	UpdateAvailable bool   `json:"updateAvailable"`
	Status          string `json:"status"`
	CheckedAt       string `json:"checkedAt"`
}

type AppRuntimeMeta struct {
	Version   string `json:"version"`
	DataDir   string `json:"dataDir"`
	ConfigDir string `json:"configDir"`
}

type EventError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Cause   string `json:"cause,omitempty"`
}

type EventPayload struct {
	Timestamp  string      `json:"timestamp"`
	Source     string      `json:"source"`
	InstanceID string      `json:"instanceId,omitempty"`
	Status     string      `json:"status,omitempty"`
	Message    string      `json:"message,omitempty"`
	Current      int         `json:"current,omitempty"`
	Total        int         `json:"total,omitempty"`
	CurrentBytes int64       `json:"currentBytes,omitempty"`
	TotalBytes   int64       `json:"totalBytes,omitempty"`
	Speed        float64     `json:"speed,omitempty"`
	Eta          float64     `json:"eta,omitempty"`
	Meta         interface{} `json:"meta,omitempty"`
	Error      *EventError `json:"error,omitempty"`
}

func NewApp() *App {
	return &App{
		accountManager:   auth.NewAccountManager(),
		instanceManager:  instances.NewManager(),
		settingsManager:  settings.NewManager(),
		runningInstances: make(map[string]*exec.Cmd),
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
	wailsRun.EventsEmit(a.ctx, eventName, data...)
}

func newEventPayload(source, instanceID, status, message string) EventPayload {
	return EventPayload{
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
		Source:     source,
		InstanceID: instanceID,
		Status:     status,
		Message:    message,
	}
}

func (a *App) emitAppError(code, message string, err error) {
	payload := newEventPayload("backend.app", "", "error", message)
	payload.Error = &EventError{
		Code:    code,
		Message: message,
	}
	if err != nil {
		payload.Error.Cause = err.Error()
	}
	a.emit(ipc.EventAppLogError, payload)
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	if err := logging.Init(constants.GetLogsDir()); err != nil {
		fmt.Printf("Failed to init logger: %v\n", err)
	}
	logging.Info("Application startup")

	logging.SetCallback(func(lvl logging.Level, msg string) {
		if lvl == logging.ERROR {
			a.emitAppError(ErrCodeAppLogError, msg, nil)
		}
	})

	if err := a.settingsManager.Load(); err != nil {
		logging.Error("Failed to load settings: %v", err)
	}

	if a.settingsManager.Data.DataPath != "" {
		absPath, err := filepath.Abs(a.settingsManager.Data.DataPath)
		if err != nil {
			logging.Error("Failed to resolve data path: %v", err)
		} else {
			if err := os.Setenv("NEZORD_DATA_DIR", absPath); err != nil {
				logging.Error("Failed to set data path: %v", err)
			} else {
				logging.Info("Using custom data path: %s", absPath)
			}
		}
	}

	dirs := []string{
		constants.GetConfigDir(),
		constants.GetInstancesDir(),
		constants.GetAssetsDir(),
		constants.GetLibrariesDir(),
		constants.GetRuntimesDir(),
		constants.GetVersionsDir(),
	}

	for _, dir := range dirs {
		if _, err := os.Stat(dir); os.IsNotExist(err) {
			if err := os.MkdirAll(dir, 0755); err != nil {
				logging.Error("Failed to create directory %s: %v", dir, err)
			}
		}
	}

	if err := a.accountManager.Load(); err != nil {
		logging.Error("Failed to load accounts: %v", err)
	}

	if err := a.instanceManager.Load(); err != nil {
		logging.Error("Failed to load instances: %v", err)
	}
}

func (a *App) shutdown(ctx context.Context) {
	logging.Info("Application shutdown initiated")

	// Kill all running instances
	a.runningMu.Lock()
	for id, cmd := range a.runningInstances {
		if cmd.Process != nil {
			logging.Info("Killing running instance: %s (PID: %d)", id, cmd.Process.Pid)
			if err := cmd.Process.Kill(); err != nil {
				logging.Error("Failed to kill instance %s: %v", id, err)
			}
		}
	}
	a.runningMu.Unlock()

	// Cancel any active downloads
	if a.downloadCancel != nil {
		logging.Info("Cancelling active downloads")
		a.downloadCancel()
	}

	logging.Info("Application shutdown complete")
	logging.Close()
}
