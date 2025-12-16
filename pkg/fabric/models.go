package fabric

import "encoding/json"

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
	MainClass MainClassData        `json:"mainClass"`
}

type MainClassData struct {
	Client string
	Server string
}

func (m *MainClassData) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err == nil {
		m.Client = s
		return nil
	}

	var obj map[string]string
	if err := json.Unmarshal(data, &obj); err == nil {
		m.Client = obj["client"]
		m.Server = obj["server"]
		return nil
	}

	return nil
}

type Library struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}
