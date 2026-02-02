package fabric

import (
	"NezordLauncher/pkg/network"
	"encoding/json"
	"fmt"
)

const MetaURL = "https://meta.fabricmc.net"

func GetLoaderVersions(gameVersion string) ([]LoaderVersion, error) {
	client := network.NewHttpClient()
	url := fmt.Sprintf("%s/v2/versions/loader/%s", MetaURL, gameVersion)

	data, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch fabric versions: %w", err)
	}

	var versions []LoaderVersion
	if err := json.Unmarshal(data, &versions); err != nil {
		return nil, fmt.Errorf("failed to parse fabric versions: %w", err)
	}

	if len(versions) == 0 {
		return nil, fmt.Errorf("no fabric loader versions found for %s", gameVersion)
	}

	return versions, nil
}
