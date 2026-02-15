package main

import (
	"NezordLauncher/pkg/downloader"
	"NezordLauncher/pkg/ipc"
	"NezordLauncher/pkg/validation"
	"context"
	"fmt"
	"time"
)

func (a *App) StartInstanceDownload(instanceID string) error {
	inst, ok := a.instanceManager.Get(instanceID)
	if !ok {
		return fmt.Errorf("instance not found: %s", instanceID)
	}

	inst.InstallState = "downloading"
	a.instanceManager.SaveInstance(inst)

	a.emitInstanceUpdated(inst)

	if err := a.downloadVersion(instanceID, inst.GameVersion); err != nil {
		inst.InstallState = "not_installed"
		a.instanceManager.SaveInstance(inst)
		a.emitInstanceUpdated(inst)
		return err
	}

	inst.InstallState = "ready"
	a.instanceManager.SaveInstance(inst)
	a.emitInstanceUpdated(inst)

	a.emitDownloadComplete(instanceID)
	return nil
}

func (a *App) DownloadVersion(versionID string) error {
	return a.downloadVersion("", versionID)
}

func (a *App) downloadVersion(instanceID, versionID string) error {
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

	_ = versionID

	pool.Start(ctx)
	fetcher := downloader.NewArtifactFetcher(pool)

	a.emitDownloadStatus(instanceID, "starting", fmt.Sprintf("Starting download for: %s", versionID))

	progressTicker := time.NewTicker(100 * time.Millisecond)
	go func() {
		for {
			select {
			case <-progressTicker.C:
				current, total := pool.Progress.GetCounts()
				a.emitDownloadProgress(instanceID, current, total)
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
			a.emitDownloadStatus(instanceID, "cancelled", "Download cancelled")
			return fmt.Errorf("cancelled")
		}
		a.emitDownloadError(instanceID, ErrCodeDownloadVersionFailed, err)
		return fmt.Errorf("download failed: %w", err)
	}

	pool.Wait()
	progressTicker.Stop()
	if len(pool.Errors()) > 0 {
		err := fmt.Errorf("download finished with %d task errors", len(pool.Errors()))
		a.emitDownloadError(instanceID, ErrCodeDownloadTaskErrors, err)
		a.emitDownloadStatus(instanceID, "completed_with_errors", "Artifacts verification completed with errors")
		return nil
	}
	a.emitDownloadStatus(instanceID, "completed", "Artifacts verification complete")
	a.emitDownloadComplete(instanceID)
	return nil
}

func (a *App) CancelDownload() {
	a.downloadMu.Lock()
	defer a.downloadMu.Unlock()
	if a.downloadCancel != nil {
		a.downloadCancel()
		a.emitDownloadStatus("", "stopping", "Stopping...")
	}
}

func (a *App) emitDownloadStatus(instanceID, status, message string) {
	a.emit(ipc.EventDownloadStatus, newEventPayload("backend.download", instanceID, status, message))
}

func (a *App) emitDownloadProgress(instanceID string, current, total int) {
	payload := newEventPayload("backend.download", instanceID, "running", "Download progress")
	payload.Current = current
	payload.Total = total
	a.emit(ipc.EventDownloadProgress, payload)
}

func (a *App) emitDownloadComplete(instanceID string) {
	a.emit(ipc.EventDownloadComplete, newEventPayload("backend.download", instanceID, "completed", "Download complete"))
}

func (a *App) emitDownloadError(instanceID, code string, err error) {
	payload := newEventPayload("backend.download", instanceID, "failed", "Download failed")
	payload.Error = &EventError{
		Code:    code,
		Message: "Download failed",
	}
	if err != nil {
		payload.Error.Cause = err.Error()
	}
	a.emit(ipc.EventDownloadError, payload)
}
