package system

import (
	"runtime"
)

type SystemInfo struct {
	OS   string
	Arch string
}

func GetSystemInfo() SystemInfo {
	return SystemInfo{
		OS:   NormalizeOS(runtime.GOOS),
		Arch: NormalizeArch(runtime.GOARCH),
	}
}

func NormalizeOS(goos string) string {
	switch goos {
	case "windows":
		return "windows"
	case "linux":
		return "linux"
	case "darwin":
		return "osx"
	default:
		return "unknown"
	}
}

func NormalizeArch(goarch string) string {
	switch goarch {
	case "amd64":
		return "x64"
	case "386":
		return "x86"
	case "arm64":
		return "arm64"
	default:
		return goarch
	}
}

func Is64Bit() bool {
	return runtime.GOARCH == "amd64"
}
