package main

import (
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/downloader"
	"NezordLauncher/pkg/ipc"
	"NezordLauncher/pkg/instances"
	"NezordLauncher/pkg/validation"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

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

func (a *App) VerifyInstance(instanceID string) ([]instances.VerificationResult, error) {
	inst, ok := a.instanceManager.Get(instanceID)
	if !ok {
		return nil, fmt.Errorf("instance not found")
	}

	finalVersionID := inst.GetLaunchVersionID()
	version, err := a.getVersionDetails(finalVersionID)
	if err != nil {
		return nil, err
	}

	return instances.VerifyInstance(version)
}

func (a *App) RepairInstance(instanceID string) error {
	broken, err := a.VerifyInstance(instanceID)
	if err != nil {
		return err
	}

	if len(broken) == 0 {
		return nil
	}

	inst, ok := a.instanceManager.Get(instanceID)
	if !ok {
		return fmt.Errorf("instance not found")
	}

	a.emitLaunchStatus(instanceID, fmt.Sprintf("Repairing %d files...", len(broken)))

	brokenMap := make(map[string]bool)
	for _, res := range broken {
		brokenMap[res.File] = true
	}

	filter := func(path string) bool {
		return brokenMap[path]
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
	pool.Start(ctx)

	fetcher := downloader.NewArtifactFetcher(pool)
	fetcher.Filter = filter

	if err := fetcher.DownloadVersion(ctx, inst.GameVersion); err != nil {
		a.emitDownloadError(instanceID, "DOWNLOAD_REPAIR_FAILED", err)
		return err
	}

	pool.Wait()

	if len(pool.Errors()) > 0 {
		err := fmt.Errorf("repair failed with %d errors", len(pool.Errors()))
		a.emitDownloadError(instanceID, "DOWNLOAD_REPAIR_PARTIAL", err)
		return err
	}

	a.emitLaunchStatus(instanceID, "Repair complete")
	return nil
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
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("explorer", instanceDir)
	} else {
		cmd = exec.Command("xdg-open", instanceDir)
	}
	return cmd.Start()
}

func (a *App) emitInstanceUpdated(inst *instances.Instance) {
	payload := newEventPayload("backend.instance", inst.ID, inst.InstallState, "Instance state updated")
	payload.Meta = inst
	a.emit(ipc.EventInstanceUpdated, payload)
}
