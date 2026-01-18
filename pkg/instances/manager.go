package instances

import (
	"NezordLauncher/pkg/constants"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

type Manager struct {
	mu        sync.RWMutex
	baseDir   string
	instances map[string]*Instance
}

func NewManager() *Manager {
	return &Manager{
		baseDir:   constants.GetInstancesDir(),
		instances: make(map[string]*Instance),
	}
}

func (m *Manager) Load() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if err := os.MkdirAll(m.baseDir, 0755); err != nil {
		return err
	}

	entries, err := os.ReadDir(m.baseDir)
	if err != nil {
		return err
	}

	m.instances = make(map[string]*Instance)

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		configPath := filepath.Join(m.baseDir, entry.Name(), "instance.json")
		if _, err := os.Stat(configPath); os.IsNotExist(err) {
			continue
		}

		data, err := os.ReadFile(configPath)
		if err != nil {
			fmt.Printf("Failed to read instance config %s: %v\n", entry.Name(), err)
			continue
		}

		var inst Instance
		if err := json.Unmarshal(data, &inst); err != nil {
			fmt.Printf("Failed to parse instance config %s: %v\n", entry.Name(), err)
			continue
		}

		m.instances[inst.ID] = &inst
	}

	return nil
}

func (m *Manager) GetAll() []Instance {
	m.mu.RLock()
	defer m.mu.RUnlock()

	list := make([]Instance, 0, len(m.instances))
	for _, i := range m.instances {
		list = append(list, *i)
	}

	sort.Slice(list, func(i, j int) bool {
		return list[i].LastPlayed.After(list[j].LastPlayed)
	})

	return list
}

func (m *Manager) Get(id string) (*Instance, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	inst, ok := m.instances[id]
	return inst, ok
}

func (m *Manager) SaveInstance(inst *Instance) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	dir := filepath.Join(m.baseDir, inst.ID)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	configPath := filepath.Join(dir, "instance.json")
	data, err := json.MarshalIndent(inst, "", "  ")
	if err != nil {
		return err
	}

	if err := os.WriteFile(configPath, data, 0644); err != nil {
		return err
	}

	m.instances[inst.ID] = inst
	return nil
}

func (m *Manager) CreateInstance(name, gameVersion string, loaderType ModloaderType, loaderVersion string) (*Instance, error) {
	baseID := slugify(name)
	id := baseID
	counter := 1
	
	m.mu.RLock()
	for {
		if _, exists := m.instances[id]; !exists {
			if _, err := os.Stat(filepath.Join(m.baseDir, id)); os.IsNotExist(err) {
				break
			}
		}
		id = fmt.Sprintf("%s-%d", baseID, counter)
		counter++
	}
	m.mu.RUnlock()

	inst := &Instance{
		ID:               id,
		Name:             name,
		GameVersion:      gameVersion,
		ModloaderType:    loaderType,
		ModloaderVersion: loaderVersion,
		InstallState:     "not_installed",
		Created:          time.Now(),
		Settings: InstanceSettings{
			RamMB: 4096,
		},
	}
	
	if err := m.SaveInstance(inst); err != nil {
		return nil, err
	}
	
	return inst, nil
}

func (m *Manager) DeleteInstance(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, ok := m.instances[id]; !ok {
		return fmt.Errorf("instance not found")
	}

	dir := filepath.Join(m.baseDir, id)
	if err := os.RemoveAll(dir); err != nil {
		return err
	}

	delete(m.instances, id)
	return nil
}

func (m *Manager) UpdateSettings(id string, settings InstanceSettings) error {
	m.mu.Lock()
	inst, ok := m.instances[id]
	m.mu.Unlock() 

	if !ok {
		return fmt.Errorf("instance not found")
	}

	inst.Settings = settings
	
	return m.SaveInstance(inst)
}

func (m *Manager) UpdatePlayTime(id string, durationSec int64) error {
	m.mu.Lock()
	inst, ok := m.instances[id]
	m.mu.Unlock()

	if !ok {
		return fmt.Errorf("instance not found")
	}

	inst.LastPlayed = time.Now()
	inst.PlayTime += durationSec
	
	return m.SaveInstance(inst)
}

func slugify(s string) string {
	var result string
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			result += string(r)
		} else if r >= 'A' && r <= 'Z' {
			result += string(r + 32)
		} else if r == ' ' || r == '-' || r == '_' {
			result += "-"
		}
	}
	if len(result) == 0 {
		return "instance"
	}
	return result
}
