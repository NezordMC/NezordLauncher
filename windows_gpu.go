//go:build windows

package main

import (
	"golang.org/x/sys/windows/registry"
)

func setWindowsGpuPreference(appPath string, preference string) error {
	keyPath := `Software\Microsoft\DirectX\UserGpuPreferences`
	k, err := registry.OpenKey(registry.CURRENT_USER, keyPath, registry.SET_VALUE)
	if err != nil {
		// Key might not exist, try to create it
		k, _, err = registry.CreateKey(registry.CURRENT_USER, keyPath, registry.SET_VALUE)
		if err != nil {
			return err
		}
	}
	defer k.Close()

	// Value format: "GpuPreference=X;"
	// 0 = Unspecified (System Default)
	// 1 = Power Saving (Integrated)
	// 2 = High Performance (Discrete)

	var val string
	switch preference {
	case "discrete":
		val = "GpuPreference=2;"
	case "integrated":
		val = "GpuPreference=1;"
	default: // auto
		val = "GpuPreference=0;"
	}

	return k.SetStringValue(appPath, val)
}
