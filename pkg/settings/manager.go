package settings

import (
	"NezordLauncher/pkg/constants"
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

type LauncherSettings struct {
	Language    string `json:"language"`
	Theme       string `json:"theme"`
	CloseAction string `json:"closeAction"`
	DataPath    string `json:"dataPath"`
}

type Manager struct {
	mu       sync.RWMutex
	filePath string
	Data     LauncherSettings
}

func NewManager() *Manager {
	return &Manager{
		filePath: filepath.Join(constants.GetConfigDir(), "settings.json"),
		Data: LauncherSettings{
			Language:    "en",
			Theme:       "dark",
			CloseAction: "keep_open",
		},
	}
}

func (m *Manager) Load() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if err := os.MkdirAll(filepath.Dir(m.filePath), 0755); err != nil {
		return err
	}

	data, err := os.ReadFile(m.filePath)
	if os.IsNotExist(err) {
		return m.saveInternal()
	}
	if err != nil {
		return err
	}

	return json.Unmarshal(data, &m.Data)
}

func (m *Manager) Get() LauncherSettings {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.Data
}

func (m *Manager) Update(settings LauncherSettings) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.Data = settings
	return m.saveInternal()
}

func (m *Manager) saveInternal() error {
	data, err := json.MarshalIndent(m.Data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(m.filePath, data, 0644)
}
