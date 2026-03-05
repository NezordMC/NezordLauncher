# Diagnostics Error Codes

Canonical backend error codes used in event payloads.

## App

- `APP_LOG_ERROR`: Internal application log callback error event.

## Download

- `DOWNLOAD_VERSION_FAILED`: Version download pipeline failed.
- `DOWNLOAD_TASK_ERRORS`: Download completed but one or more tasks failed verification.
- `DOWNLOAD_REPAIR_FAILED`: Repair pipeline failed to fetch required files.
- `DOWNLOAD_REPAIR_PARTIAL`: Repair finished with partial failures.

## Launch

- `JAVA_PATH_INSTANCE_INVALID`: Instance-specific Java path is invalid.
- `JAVA_PATH_SETTINGS_INVALID`: Global settings Java path is invalid.
- `LAUNCH_COMMAND_CREATE_FAILED`: Failed to build launch command/process.
- `LAUNCH_RUNTIME_ERROR`: Game process exited with runtime error.

## Payload Example

```json
{
  "source": "backend.launch",
  "status": "failed",
  "error": {
    "code": "LAUNCH_RUNTIME_ERROR",
    "message": "Game process exited with error",
    "cause": "exit status 1"
  }
}
```
