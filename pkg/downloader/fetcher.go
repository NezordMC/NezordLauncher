package downloader

import (
	"encoding/json"
	"fmt"
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/models"
	"NezordLauncher/pkg/network"
	"NezordLauncher/pkg/system"
	"path/filepath"
	"os"
)

type ArtifactFetcher struct {
	client *network.HttpClient
	pool   *WorkerPool
}

func NewArtifactFetcher(pool *WorkerPool) *ArtifactFetcher {
	return &ArtifactFetcher{
		client: network.NewHttpClient(),
		pool:   pool,
	}
}

func (f *ArtifactFetcher) DownloadVersion(versionID string) error {
	manifest, err := f.fetchManifest()
	if err != nil {
		return err
	}

	versionURL := ""
	for _, v := range manifest.Versions {
		if v.ID == versionID {
			versionURL = v.URL
			break
		}
	}

	if versionURL == "" {
		return fmt.Errorf("version %s not found in manifest", versionID)
	}

	details, err := f.fetchVersionDetails(versionURL)
	if err != nil {
		return err
	}

	if err := f.processLibraries(details.Libraries); err != nil {
		return err
	}

	if err := f.processAssets(details.AssetIndex); err != nil {
		return err
	}

	if err := f.processClient(details.Downloads.Client, versionID); err != nil {
		return err
	}

	return nil
}

func (f *ArtifactFetcher) fetchManifest() (*models.VersionManifest, error) {
	data, err := f.client.Get(constants.VersionManifestV2URL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch version manifest: %w", err)
	}

	var manifest models.VersionManifest
	if err := json.Unmarshal(data, &manifest); err != nil {
		return nil, fmt.Errorf("failed to parse manifest: %w", err)
	}

	return &manifest, nil
}

func (f *ArtifactFetcher) fetchVersionDetails(url string) (*models.VersionDetail, error) {
	data, err := f.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch version details: %w", err)
	}

	var detail models.VersionDetail
	if err := json.Unmarshal(data, &detail); err != nil {
		return nil, fmt.Errorf("failed to parse version details: %w", err)
	}

	return &detail, nil
}

func (f *ArtifactFetcher) processLibraries(libs []models.Library) error {
	sysInfo := system.GetSystemInfo()
	libDir := constants.GetLibrariesDir()

	for _, lib := range libs {
		if !lib.IsAllowed(sysInfo.OS) {
			continue
		}

		if lib.Downloads.Artifact.URL != "" {
			// PERBAIKAN DI SINI: Menggunakan GetPath()
			path := filepath.Join(libDir, lib.Downloads.Artifact.GetPath())
			f.pool.Submit(&DownloadTask{
				URL:         lib.Downloads.Artifact.URL,
				Destination: path,
				SHA1:        lib.Downloads.Artifact.SHA1,
				NameID:      fmt.Sprintf("Library: %s", lib.Name),
				Client:      f.client,
			})
		}

		if native, ok := system.GetNativeArtifact(lib); ok {
			// PERBAIKAN DI SINI: Menggunakan GetPath()
			path := filepath.Join(libDir, native.GetPath())
			f.pool.Submit(&DownloadTask{
				URL:         native.URL,
				Destination: path,
				SHA1:        native.SHA1,
				NameID:      fmt.Sprintf("Native: %s", lib.Name),
				Client:      f.client,
			})
		}
	}
	return nil
}

func (f *ArtifactFetcher) processAssets(index models.AssetIndex) error {
	data, err := f.client.Get(index.URL)
	if err != nil {
		return fmt.Errorf("failed to fetch asset index: %w", err)
	}

	var assets struct {
		Objects map[string]struct {
			Hash string `json:"hash"`
			Size int    `json:"size"`
		} `json:"objects"`
	}

	if err := json.Unmarshal(data, &assets); err != nil {
		return fmt.Errorf("failed to parse asset index: %w", err)
	}

	assetDir := constants.GetAssetsDir()
	
	indexPath := filepath.Join(assetDir, "indexes", index.ID+".json")
	if err := os.MkdirAll(filepath.Dir(indexPath), 0755); err == nil {
		os.WriteFile(indexPath, data, 0644)
	}

	for name, obj := range assets.Objects {
		subDir := obj.Hash[:2]
		objectPath := filepath.Join(assetDir, "objects", subDir, obj.Hash)
		objectURL := fmt.Sprintf("%s%s/%s", constants.ResourcesURL, subDir, obj.Hash)

		f.pool.Submit(&DownloadTask{
			URL:         objectURL,
			Destination: objectPath,
			SHA1:        obj.Hash,
			NameID:      fmt.Sprintf("Asset: %s", name),
			Client:      f.client,
		})
	}

	return nil
}

func (f *ArtifactFetcher) processClient(client models.DownloadInfo, versionID string) error {
	path := filepath.Join(constants.GetInstancesDir(), versionID, fmt.Sprintf("%s.jar", versionID))
	
	f.pool.Submit(&DownloadTask{
		URL:         client.URL,
		Destination: path,
		SHA1:        client.SHA1,
		NameID:      fmt.Sprintf("Client: %s", versionID),
		Client:      f.client,
	})
	
	return nil
}
