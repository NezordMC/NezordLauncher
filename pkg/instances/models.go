package instances

import "time"

type ModloaderType string

const (
	ModloaderVanilla ModloaderType = "vanilla"
	ModloaderFabric  ModloaderType = "fabric"
	ModloaderQuilt   ModloaderType = "quilt"
	ModloaderForge   ModloaderType = "forge"
)

type Instance struct {
	ID               string           `json:"id"`
	Name             string           `json:"name"`
	Icon             string           `json:"icon"`
	GameVersion      string           `json:"gameVersion"`
	ModloaderType    ModloaderType    `json:"modloaderType"`
	ModloaderVersion string           `json:"modloaderVersion"`
	InstallState     string           `json:"installState"`
	Settings         InstanceSettings `json:"settings"`
	Created          time.Time        `json:"created"`
	LastPlayed       time.Time        `json:"lastPlayed"`
	PlayTime         int64            `json:"playTime"`
}

type InstanceSettings struct {
	RamMB         int    `json:"ramMB"`
	JavaPath      string `json:"javaPath"`
	ResolutionW   int    `json:"resolutionW"`
	ResolutionH   int    `json:"resolutionH"`
	JvmArgs       string `json:"jvmArgs"`
	OverrideJava  bool   `json:"overrideJava"`
	OverrideRam   bool   `json:"overrideRam"`
	GpuPreference string `json:"gpuPreference"`
	WrapperCommand string `json:"wrapperCommand"`
}

func (i *Instance) GetLaunchVersionID() string {
	if i.ModloaderType == ModloaderVanilla {
		return i.GameVersion
	}
	if i.ModloaderType == ModloaderFabric {
		return "fabric-loader-" + i.ModloaderVersion + "-" + i.GameVersion
	}
	if i.ModloaderType == ModloaderQuilt {
		return "quilt-loader-" + i.ModloaderVersion + "-" + i.GameVersion
	}
	return i.GameVersion
}
