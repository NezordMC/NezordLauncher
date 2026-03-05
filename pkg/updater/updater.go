package updater

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"runtime"
	"time"
)

const (
	RepoOwner = "NezordMC"
	RepoName  = "NezordLauncher"
)

type Asset struct {
	Name               string `json:"name"`
	BrowserDownloadURL string `json:"browser_download_url"`
}

type Release struct {
	TagName     string  `json:"tag_name"`
	HTMLURL     string  `json:"html_url"`
	Prerelease  bool    `json:"prerelease"`
	PublishedAt string  `json:"published_at"`
	Body        string  `json:"body"`
	Assets      []Asset `json:"assets"`
}

type UpdateInfo struct {
	Available   bool   `json:"available"`
	Version     string `json:"version"`
	URL         string `json:"url"`
	DownloadURL string `json:"download_url"`
	Description string `json:"description"`
}

func CheckForUpdate(currentVersion string) (*UpdateInfo, error) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/releases/latest", RepoOwner, RepoName)

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
		downloadURL := ""
		for _, asset := range release.Assets {
			if runtime.GOOS == "linux" && strings.HasSuffix(asset.Name, ".AppImage") {
				downloadURL = asset.BrowserDownloadURL
				break
			}
			if runtime.GOOS == "windows" && strings.HasSuffix(asset.Name, ".exe") {
				downloadURL = asset.BrowserDownloadURL
				break
			}
		}

		return &UpdateInfo{
			Available:   true,
			Version:     release.TagName,
			URL:         release.HTMLURL,
			DownloadURL: downloadURL,
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
