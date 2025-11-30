package models

import (
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
	MinecraftArguments string      `json:"minecraftArguments"`
	Type               string      `json:"type"`
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
}

type Library struct {
	Name      string             `json:"name"`
	Downloads LibraryDownloadMap `json:"downloads"`
	Rules     []Rule             `json:"rules,omitempty"`
}

type LibraryDownloadMap struct {
	Artifact DownloadInfo `json:"artifact"`
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
