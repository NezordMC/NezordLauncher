package downloader

import (
	"NezordLauncher/pkg/models"
	"testing"
)

func TestMavenPathGeneration(t *testing.T) {
	lib := models.Library{
		Name: "net.fabricmc:fabric-loader:0.14.25",
		URL:  "https://maven.fabricmc.net/",
	}

	expectedPath := "net/fabricmc/fabric-loader/0.14.25/fabric-loader-0.14.25.jar"
	gotPath := lib.GetMavenPath()

	if gotPath != expectedPath {
		t.Errorf("Maven path generation failed. Got %s, want %s", gotPath, expectedPath)
	}
}

func TestMavenUrlConstruction(t *testing.T) {

	lib := models.Library{
		Name: "net.fabricmc:fabric-loader:0.14.25",
		URL:  "https://maven.fabricmc.net",
	}
	
	relPath := lib.GetMavenPath()
	baseURL := lib.URL
	if baseURL != "" && baseURL[len(baseURL)-1] != '/' {
		baseURL += "/"
	}
	
	fullUrl := baseURL + relPath
	expectedUrl := "https://maven.fabricmc.net/net/fabricmc/fabric-loader/0.14.25/fabric-loader-0.14.25.jar"
	
	if fullUrl != expectedUrl {
		t.Errorf("Maven URL construction failed. Got %s, want %s", fullUrl, expectedUrl)
	}
}
