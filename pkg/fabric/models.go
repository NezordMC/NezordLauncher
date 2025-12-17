package fabric

import (
	"NezordLauncher/pkg/models"
)

type LoaderVersion struct {
	Loader       Loader       `json:"loader"`
	Intermediary Intermediary `json:"intermediary"`
	LauncherMeta LauncherMeta `json:"launcherMeta"`
}

type Loader struct {
	Separator string `json:"separator"`
	Build     int    `json:"build"`
	Maven     string `json:"maven"`
	Version   string `json:"version"`
	Stable    bool   `json:"stable"`
}

type Intermediary struct {
	Maven   string `json:"maven"`
	Version string `json:"version"`
	Stable  bool   `json:"stable"`
}

type LauncherMeta struct {
	Version   int                  `json:"version"`
	Libraries map[string][]Library `json:"libraries"`
	MainClass models.MainClassData `json:"mainClass"`
}

type Library struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}
