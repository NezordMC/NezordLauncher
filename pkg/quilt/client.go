package quilt

import (
	"NezordLauncher/pkg/network"
	"encoding/json"
	"fmt"
)

const MetaURL = "https://meta.quiltmc.org"

func GetLoaderVersions(gameVersion string) ([]LoaderVersion, error) {
	client := network.NewHttpClient()
	// Quilt uses v3 API structure
	url := fmt.Sprintf("%s/v3/versions/loader/%s", MetaURL, gameVersion)

	data, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch quilt versions: %w", err)
	}

	var versions []LoaderVersion
	if err := json.Unmarshal(data, &versions); err != nil {
		return nil, fmt.Errorf("failed to parse quilt versions: %w", err)
	}

	if len(versions) == 0 {
		return nil, fmt.Errorf("no quilt loader versions found for %s", gameVersion)
	}

	return versions, nil
}
