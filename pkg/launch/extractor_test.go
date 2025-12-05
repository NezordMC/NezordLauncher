package launch

import (
	"archive/zip"
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/models"
	"NezordLauncher/pkg/system"
	"os"
	"path/filepath"
	"testing"
)

func TestExtractNatives(t *testing.T) {
	tempDir := t.TempDir()
	
	originalHome := os.Getenv("HOME")
	os.Setenv("HOME", tempDir) 
	defer os.Setenv("HOME", originalHome)
	realMockLibDir := constants.GetLibrariesDir()
	if err := os.MkdirAll(realMockLibDir, 0755); err != nil {
		t.Fatalf("Failed to create mock lib dir: %v", err)
	}

	mockNativeDir := filepath.Join(tempDir, "natives")

	sysInfo := system.GetSystemInfo()
	classifierKey := sysInfo.OS 
	classifierValue := "natives-" + sysInfo.OS
	
	dummyLib := models.Library{
		Name: "com.example:native:1.0",
		Natives: map[string]string{
			classifierKey: classifierValue,
		},
		Downloads: models.LibraryDownloadMap{
			Classifiers: map[string]models.DownloadInfo{
				classifierValue: {
					URL: "http://mock/native.jar",
					Path: "com/example/native/1.0/native.jar",
				},
			},
		},
	}

	jarPath := filepath.Join(realMockLibDir, "com/example/native/1.0/native.jar")
	if err := os.MkdirAll(filepath.Dir(jarPath), 0755); err != nil {
		t.Fatalf("Failed to create jar dir: %v", err)
	}
	createMockJar(t, jarPath)

	libs := []models.Library{dummyLib}
	err := ExtractNatives(libs, mockNativeDir)
	if err != nil {
		t.Fatalf("ExtractNatives failed: %v", err)
	}

	expectedFile := filepath.Join(mockNativeDir, "library.so")
	if _, err := os.Stat(expectedFile); os.IsNotExist(err) {
		t.Errorf("Expected native file library.so was not extracted")
	}
	ignoredFile := filepath.Join(mockNativeDir, "META-INF", "MANIFEST.MF")
	if _, err := os.Stat(ignoredFile); !os.IsNotExist(err) {
		t.Errorf("META-INF should have been ignored/skipped")
	}
	
	t.Log("Native extraction verified successfully")
}

func createMockJar(t *testing.T, path string) {
	file, err := os.Create(path)
	if err != nil {
		t.Fatalf("Failed to create mock jar: %v", err)
	}
	defer file.Close()

	writer := zip.NewWriter(file)
	defer writer.Close()

	f, _ := writer.Create("library.so")
	f.Write([]byte("binary data"))

	m, _ := writer.Create("META-INF/MANIFEST.MF")
	m.Write([]byte("Manifest-Version: 1.0"))
}