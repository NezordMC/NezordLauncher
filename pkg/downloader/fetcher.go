package downloader

import (
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/models"
	"NezordLauncher/pkg/network"
	"NezordLauncher/pkg/system"
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

func (f *ArtifactFetcher) DownloadVersion(versionID string) error {

	v, err := f.getVersionDetails(versionID)
	if err != nil {
		return err
	}


	if err := f.downloadClient(v); err != nil {
		return err
	}


	if err := f.downloadLibraries(v); err != nil {
		return err
	}


	if err := f.downloadAssets(v); err != nil {
		return err
	}

	return nil
}

func (f *ArtifactFetcher) getVersionDetails(versionID string) (*models.VersionDetail, error) {

	localPath := filepath.Join(constants.GetVersionsDir(), versionID, fmt.Sprintf("%s.json", versionID))
	if _, err := os.Stat(localPath); err == nil {
		data, err := os.ReadFile(localPath)
		if err != nil {
			return nil, err
		}
		var detail models.VersionDetail
		if err := json.Unmarshal(data, &detail); err != nil {
			return nil, err
		}
		return &detail, nil
	}


	client := network.NewHttpClient()
	manifestData, err := client.Get(constants.VersionManifestV2URL)
	if err != nil {
		return nil, err
	}

	var manifest models.VersionManifest
	if err := json.Unmarshal(manifestData, &manifest); err != nil {
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

	detailData, err := client.Get(targetURL)
	if err != nil {
		return nil, err
	}

	var detail models.VersionDetail
	if err := json.Unmarshal(detailData, &detail); err != nil {
		return nil, err
	}

	return &detail, nil
}

func (f *ArtifactFetcher) downloadClient(v *models.VersionDetail) error {

	if v.Downloads.Client.URL != "" {
		path := filepath.Join(constants.GetInstancesDir(), v.ID, fmt.Sprintf("%s.jar", v.ID))
		f.pool.Submit(Task{
			URL:  v.Downloads.Client.URL,
			Path: path,
			SHA1: v.Downloads.Client.SHA1,
		})
	}
	return nil
}

func (f *ArtifactFetcher) downloadLibraries(v *models.VersionDetail) error {
	sysInfo := system.GetSystemInfo()
	libDir := constants.GetLibrariesDir()

	for _, lib := range v.Libraries {
		if !lib.IsAllowed(sysInfo.OS) {
			continue
		}


		if lib.Downloads.Artifact.URL != "" {
			path := lib.Downloads.Artifact.GetPath()
			fullPath := filepath.Join(libDir, path)
			f.pool.Submit(Task{
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
				
				f.pool.Submit(Task{
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
					f.pool.Submit(Task{
						URL:  artifact.URL,
						Path: fullPath,
						SHA1: artifact.SHA1,
					})
				}
			}
		}
	}
	return nil
}

func (f *ArtifactFetcher) downloadAssets(v *models.VersionDetail) error {

	idxURL := v.AssetIndex.URL
	if idxURL == "" {
		return nil
	}
	
	idxPath := filepath.Join(constants.GetAssetsDir(), "indexes", fmt.Sprintf("%s.json", v.AssetIndex.ID))
	

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
		os.WriteFile(idxPath, idxData, 0644)
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

	for _, obj := range indexObj.Objects {
		path := filepath.Join(objectsDir, obj.Hash[:2], obj.Hash)
		url := fmt.Sprintf("%s%s/%s", baseAssetURL, obj.Hash[:2], obj.Hash)
		
		f.pool.Submit(Task{
			URL:  url,
			Path: path,
			SHA1: obj.Hash,
		})
	}

	return nil
}
