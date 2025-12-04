package models

import (
	"encoding/json"
	"path/filepath"
	"strings"
	"time"
)

type VersionManifest struct {
	Latest   LatestVersion `json:"latest"`
	Versions []Version     `json:"versions"`
}

type LatestVersion struct {
	Release  string `json:"release"`
	Snapshot string `json:"snapshot"`
}

type Version struct {
	ID              string    `json:"id"`
	Type            string    `json:"type"`
	URL             string    `json:"url"`
	Time            time.Time `json:"time"`
	ReleaseTime     time.Time `json:"releaseTime"`
	SHA1            string    `json:"sha1"`
	ComplianceLevel int       `json:"complianceLevel"`
}

type VersionDetail struct {
	ID                 string      `json:"id"`
	AssetIndex         AssetIndex  `json:"assetIndex"`
	Assets             string      `json:"assets"`
	Downloads          DownloadMap `json:"downloads"`
	Libraries          []Library   `json:"libraries"`
	MainClass          string      `json:"mainClass"`
	MinecraftArguments string      `json:"minecraftArguments,omitempty"`
	Arguments          Arguments   `json:"arguments,omitempty"`
	Type               string      `json:"type"`
}

type Arguments struct {
	Game []Argument `json:"game,omitempty"`
	JVM  []Argument `json:"jvm,omitempty"`
}

type Argument struct {
	Values []string
	Rules  []Rule
}

func (a *Argument) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err == nil {
		a.Values = []string{s}
		return nil
	}

	var obj struct {
		Rules []Rule          `json:"rules"`
		Value json.RawMessage `json:"value"`
	}
	
	if err := json.Unmarshal(data, &obj); err != nil {
		return err
	}

	a.Rules = obj.Rules

	var sVal string
	if err := json.Unmarshal(obj.Value, &sVal); err == nil {
		a.Values = []string{sVal}
		return nil
	}

	var sSlice []string
	if err := json.Unmarshal(obj.Value, &sSlice); err == nil {
		a.Values = sSlice
		return nil
	}

	return nil
}

type AssetIndex struct {
	ID        string `json:"id"`
	SHA1      string `json:"sha1"`
	Size      int    `json:"size"`
	TotalSize int    `json:"totalSize"`
	URL       string `json:"url"`
}

type DownloadMap struct {
	Client         DownloadInfo `json:"client"`
	ClientMappings DownloadInfo `json:"client_mappings"`
	Server         DownloadInfo `json:"server"`
	ServerMappings DownloadInfo `json:"server_mappings"`
}

type DownloadInfo struct {
	SHA1 string `json:"sha1"`
	Size int    `json:"size"`
	URL  string `json:"url"`
	Path string `json:"path,omitempty"`
}

func (d DownloadInfo) GetPath() string {
	if d.Path != "" {
		return d.Path
	}
	
	if d.URL == "" {
		return ""
	}

	parts := strings.Split(d.URL, "/")
	for i, part := range parts {
		if part == "libraries.minecraft.net" && i+1 < len(parts) {
			return strings.Join(parts[i+1:], "/")
		}
	}
	
	return filepath.Base(d.URL)
}

type Library struct {
	Name      string             `json:"name"`
	Downloads LibraryDownloadMap `json:"downloads"`
	Rules     []Rule             `json:"rules,omitempty"`
	Natives   map[string]string  `json:"natives,omitempty"`
}

type LibraryDownloadMap struct {
	Artifact    DownloadInfo            `json:"artifact"`
	Classifiers map[string]DownloadInfo `json:"classifiers,omitempty"`
}

type Rule struct {
	Action string   `json:"action"`
	OS     OSConfig `json:"os"`
}

type OSConfig struct {
	Name string `json:"name"`
}

func (l *Library) IsAllowed(osName string) bool {
	if len(l.Rules) == 0 {
		return true
	}

	allowed := false
	for _, rule := range l.Rules {
		isActionAllow := rule.Action == "allow"
		
		if rule.OS.Name == "" {
			allowed = isActionAllow
			continue
		}

		if rule.OS.Name == osName {
			allowed = isActionAllow
		}
	}
	return allowed
}
