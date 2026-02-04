//go:build !windows

package main

func setWindowsGpuPreference(appPath string, preference string) error {
	return nil
}
