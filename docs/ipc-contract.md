# IPC Contract (Wails Bridge)

This document defines the stable IPC contract between frontend and backend for `v1.0.0` scope.

## Invoke Methods (Frontend -> Backend)

- `LaunchInstance(instanceID)`
- `StopInstance(instanceID)`
- `StartInstanceDownload(instanceID)`
- `CancelDownload()`
- `CreateInstance(name, gameVersion, modloaderType, modloaderVersion)`
- `UpdateInstanceSettings(id, settings)`
- `DeleteInstance(id)`
- `GetInstances()`
- `GetVanillaVersions()`
- `GetFabricLoaders(mcVersion)`
- `GetQuiltLoaders(mcVersion)`
- `GetAccounts()`
- `GetActiveAccount()`
- `AddOfflineAccount(username)`
- `LoginElyBy(username, password)`
- `SetActiveAccount(uuid)`
- `RemoveAccount(uuid)`
- `GetSettings()`
- `UpdateGlobalSettings(settings)`
- `ScanJavaInstallations()`
- `VerifyJavaPath(path)`
- `CheckForUpdates(currentVersion)`
- `GetAppVersion()`

## Event Channels (Backend -> Frontend)

Defined in backend `pkg/ipc/events.go` and frontend `frontend/src/lib/ipc.ts`.

- `app.log.error`
- `instance.updated`
- `download.status`
- `download.progress`
- `download.complete`
- `download.error`
- `launch.status`
- `launch.error`
- `launch.game.log`
- `launch.exit`

## Event Payload Contract

All events use a shared shape:

```json
{
  "timestamp": "RFC3339",
  "source": "backend.module",
  "instanceId": "optional",
  "status": "optional",
  "message": "optional",
  "current": 0,
  "total": 0,
  "meta": {},
  "error": {
    "code": "STRING_CODE",
    "message": "human message",
    "cause": "optional technical cause"
  }
}
```

## Contract Rules

- Event names are constants-only; no raw string literals in stores.
- New event names require update in both `pkg/ipc/events.go` and `frontend/src/lib/ipc.ts`.
- Breaking payload changes require versioned migration notes before release.
