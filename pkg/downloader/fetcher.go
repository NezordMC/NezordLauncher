package downloader

import (
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/launch"
	"NezordLauncher/pkg/models"
	"NezordLauncher/pkg/network"
	"NezordLauncher/pkg/system"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type ArtifactFetcher struct {
	pool *WorkerPool
}

func NewArtifactFetcher(pool *WorkerPool) *ArtifactFetcher {
	return &ArtifactFetcher{pool: pool}
}

func (f *ArtifactFetcher) DownloadVersion(ctx context.Context, versionID string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	v, err := f.getVersionDetails(versionID, map[string]struct{}{})
	if err != nil {
		return err
	}

	if ctx.Err() != nil {
		return ctx.Err()
	}

	if err := f.downloadClient(ctx, v); err != nil {
		return err
	}

	if err := f.downloadLibraries(ctx, v); err != nil {
		return err
	}

	if err := f.downloadAssets(ctx, v); err != nil {
		return err
	}

	return nil
}

func (f *ArtifactFetcher) getVersionDetails(versionID string, visited map[string]struct{}) (*models.VersionDetail, error) {
	if _, ok := visited[versionID]; ok {
		return nil, fmt.Errorf("version inheritance loop detected")
	}
	visited[versionID] = struct{}{}

	detail, err := f.loadCachedVersion(versionID)
	if err != nil {
		return nil, err
	}
	if detail == nil {
		detail, err = f.fetchAndCacheVersion(versionID)
		if err != nil {
			return nil, err
		}
	}

	if detail.InheritsFrom != "" {
		parent, err := f.getVersionDetails(detail.InheritsFrom, visited)
		if err != nil {
			return nil, err
		}
		return launch.MergeVersions(detail, parent), nil
	}

	return detail, nil
}

func (f *ArtifactFetcher) loadCachedVersion(versionID string) (*models.VersionDetail, error) {
	localPath := filepath.Join(constants.GetVersionsDir(), versionID, fmt.Sprintf("%s.json", versionID))
	data, err := os.ReadFile(localPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var detail models.VersionDetail
	if err := json.Unmarshal(data, &detail); err != nil {
		return nil, err
	}
	return &detail, nil
}

func (f *ArtifactFetcher) fetchManifest() (*models.VersionManifest, error) {
	client := network.NewHttpClient()
	manifestData, err := client.Get(constants.VersionManifestV2URL)
	if err != nil {
		return nil, err
	}
	cachePath := filepath.Join(constants.GetVersionsDir(), "version_manifest_v2.json")
	_ = AtomicWriteFile(cachePath, manifestData)

	var manifest models.VersionManifest
	if err := json.Unmarshal(manifestData, &manifest); err != nil {
		return nil, err
	}
	return &manifest, nil
}

func (f *ArtifactFetcher) fetchAndCacheVersion(versionID string) (*models.VersionDetail, error) {
	manifest, err := f.fetchManifest()
	if err != nil {
		return nil, err
	}

	targetURL := ""
	for _, v := range manifest.Versions {
		if v.ID == versionID {
			targetURL = v.URL
			break
		}
	}
	if targetURL == "" {
		return nil, fmt.Errorf("version %s not found", versionID)
	}

	client := network.NewHttpClient()
	detailData, err := client.Get(targetURL)
	if err != nil {
		return nil, err
	}

	var detail models.VersionDetail
	if err := json.Unmarshal(detailData, &detail); err != nil {
		return nil, err
	}

	cacheDir := filepath.Join(constants.GetVersionsDir(), versionID)
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return nil, err
	}
	cachePath := filepath.Join(cacheDir, fmt.Sprintf("%s.json", versionID))
	if err := AtomicWriteFile(cachePath, detailData); err != nil {
		return nil, err
	}
	return &detail, nil
}

func (f *ArtifactFetcher) downloadClient(ctx context.Context, v *models.VersionDetail) error {
	if v.Downloads.Client.URL != "" {
		path := filepath.Join(constants.GetVersionsDir(), v.ID, fmt.Sprintf("%s.jar", v.ID))

		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			os.MkdirAll(filepath.Dir(path), 0755)

			f.pool.Progress.AddTotal(1)
			f.pool.Submit(Task{
				URL:  v.Downloads.Client.URL,
				Path: path,
				SHA1: v.Downloads.Client.SHA1,
			})
		}
	}
	return nil
}

func (f *ArtifactFetcher) downloadLibraries(ctx context.Context, v *models.VersionDetail) error {
	sysInfo := system.GetSystemInfo()
	libDir := constants.GetLibrariesDir()

	var tasks []Task

	for _, lib := range v.Libraries {
		if !lib.IsAllowed(sysInfo.OS) {
			continue
		}

		if lib.Downloads.Artifact.URL != "" {
			path := lib.Downloads.Artifact.GetPath()
			fullPath := filepath.Join(libDir, path)
			tasks = append(tasks, Task{
				URL:  lib.Downloads.Artifact.URL,
				Path: fullPath,
				SHA1: lib.Downloads.Artifact.SHA1,
			})
		} else if lib.Name != "" {
			relPath := lib.GetMavenPath()
			if relPath != "" {
				baseURL := lib.URL
				if baseURL == "" {
					baseURL = "https://libraries.minecraft.net/"
				}

				if !strings.HasSuffix(baseURL, "/") {
					baseURL += "/"
				}

				fullUrl := baseURL + relPath
				fullPath := filepath.Join(libDir, relPath)

				tasks = append(tasks, Task{
					URL:  fullUrl,
					Path: fullPath,
				})
			}
		}

		if lib.Natives != nil {
			if nativeKey, ok := lib.Natives[sysInfo.OS]; ok {
				if artifact, exists := lib.Downloads.Classifiers[nativeKey]; exists {
					path := artifact.GetPath()
					fullPath := filepath.Join(libDir, path)
					tasks = append(tasks, Task{
						URL:  artifact.URL,
						Path: fullPath,
						SHA1: artifact.SHA1,
					})
				}
			}
		}
	}

	if len(tasks) > 0 {
		f.pool.Progress.AddTotal(len(tasks))

		for _, t := range tasks {
			if ctx.Err() != nil {
				return ctx.Err()
			}
			f.pool.Submit(t)
		}
	}

	return nil
}

func (f *ArtifactFetcher) downloadAssets(ctx context.Context, v *models.VersionDetail) error {
	idxURL := v.AssetIndex.URL
	if idxURL == "" {
		return nil
	}

	indexID := v.AssetIndex.ID
	if indexID == "" {
		if v.Assets != "" {
			indexID = v.Assets
		} else {
			indexID = v.ID
		}
	}
	idxPath := filepath.Join(constants.GetAssetsDir(), "indexes", fmt.Sprintf("%s.json", indexID))

	client := network.NewHttpClient()
	idxData, err := client.Get(idxURL)
	if err != nil {
		if cached, err := os.ReadFile(idxPath); err == nil {
			idxData = cached
		} else {
			return fmt.Errorf("failed to fetch asset index: %w", err)
		}
	} else {
		os.MkdirAll(filepath.Dir(idxPath), 0755)
		_ = AtomicWriteFile(idxPath, idxData)
	}

	var indexObj struct {
		Objects map[string]struct {
			Hash string `json:"hash"`
			Size int    `json:"size"`
		} `json:"objects"`
	}

	if err := json.Unmarshal(idxData, &indexObj); err != nil {
		return err
	}

	baseAssetURL := "https://resources.download.minecraft.net/"
	objectsDir := filepath.Join(constants.GetAssetsDir(), "objects")

	var tasks []Task
	for _, obj := range indexObj.Objects {
		path := filepath.Join(objectsDir, obj.Hash[:2], obj.Hash)
		url := fmt.Sprintf("%s%s/%s", baseAssetURL, obj.Hash[:2], obj.Hash)

		tasks = append(tasks, Task{
			URL:  url,
			Path: path,
			SHA1: obj.Hash,
		})
	}

	if len(tasks) > 0 {
		f.pool.Progress.AddTotal(len(tasks))

		for _, t := range tasks {
			if ctx.Err() != nil {
				return ctx.Err()
			}
			f.pool.Submit(t)
		}
	}

	return nil
}
