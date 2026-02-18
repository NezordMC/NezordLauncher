package updater

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

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

	if currentVersion != "dev" && compareVersions(release.TagName, currentVersion) > 0 {
		return &UpdateInfo{
			Available:   true,
			Version:     release.TagName,
			URL:         release.HTMLURL, // This field doesn't exist in UpdateInfo struct definition in previous view! Wait, checking file content again.
			Description: release.Body,
		}, nil
	}

	return &UpdateInfo{Available: false}, nil
}

func compareVersions(v1, v2 string) int {
	p1 := parseVersion(v1)
	p2 := parseVersion(v2)

	maxLen := len(p1)
	if len(p2) > maxLen {
		maxLen = len(p2)
	}

	for i := 0; i < maxLen; i++ {
		v1Val := 0
		if i < len(p1) {
			v1Val = p1[i]
		}
		v2Val := 0
		if i < len(p2) {
			v2Val = p2[i]
		}

		if v1Val < v2Val {
			return -1
		}
		if v1Val > v2Val {
			return 1
		}
	}
	return 0
}

func parseVersion(v string) []int {
	v = strings.TrimPrefix(v, "v")
	parts := strings.Split(v, ".")
	res := make([]int, 0, len(parts))
	for _, p := range parts {
		if idx := strings.IndexAny(p, "-+"); idx != -1 {
			p = p[:idx]
		}
		val, err := strconv.Atoi(p)
		if err == nil {
			res = append(res, val)
		}
	}
	return res
}
