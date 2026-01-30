package updater

import (
	"encoding/json"
	"fmt"
	"net/http"

	"time"
)

const (
	RepoOwner = "NezordMC"
	RepoName  = "NezordLauncher"
)

type Release struct {
	TagName     string `json:"tag_name"`
	HTMLURL     string `json:"html_url"`
	Prerelease  bool   `json:"prerelease"`
	PublishedAt string `json:"published_at"`
	Body        string `json:"body"`
}

type UpdateInfo struct {
	Available   bool   `json:"available"`
	Version     string `json:"version"`
	URL         string `json:"url"`
	Description string `json:"description"`
}

func CheckForUpdate(currentVersion string) (*UpdateInfo, error) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/releases/latest", RepoOwner, RepoName)
	
	// If current version is a dev build or beta, we might want to check for pre-releases too
	// ignoring that for now, focusing on "latest" which is usually the latest stable/beta designated by GitHub
	
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch release info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var release Release
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return nil, fmt.Errorf("failed to decode release info: %w", err)
	}

	// Simple version comparison: string difference
	// In a real scenario, use semver library, but for now strict string inequality is enough
	// assuming tags are consistent (e.g. "v0.1.0")
	if release.TagName != currentVersion && release.TagName != "v"+currentVersion && currentVersion != "dev" {
		return &UpdateInfo{
			Available:   true,
			Version:     release.TagName,
			URL:         release.HTMLURL,
			Description: release.Body,
		}, nil
	}

	return &UpdateInfo{Available: false}, nil
}
