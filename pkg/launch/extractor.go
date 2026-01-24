package launch

import (
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/models"
	"NezordLauncher/pkg/system"
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

func ExtractNatives(libs []models.Library, targetDir string) error {
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return fmt.Errorf("failed to create natives directory: %w", err)
	}

	libDir := constants.GetLibrariesDir()

	for _, lib := range libs {
		artifact, ok := system.GetNativeArtifact(lib)
		if !ok {
			continue
		}
		jarPath := filepath.Join(libDir, artifact.GetPath())

		if err := extractJar(jarPath, targetDir); err != nil {
			return fmt.Errorf("failed to extract natives from %s: %w", lib.Name, err)
		}
	}

	return nil
}

func extractJar(jarPath string, destDir string) error {
	reader, err := zip.OpenReader(jarPath)
	if err != nil {
		return fmt.Errorf("failed to open jar file %s: %w", jarPath, err)
	}
	defer reader.Close()

	for _, file := range reader.File {
		if file.FileInfo().IsDir() || strings.HasPrefix(file.Name, "META-INF") {
			continue
		}
		lower := strings.ToLower(file.Name)
		if strings.HasSuffix(lower, ".sha1") || strings.HasSuffix(lower, ".md5") || strings.HasSuffix(lower, ".txt") {
			continue
		}

		destPath := filepath.Join(destDir, file.Name)

		if !strings.HasPrefix(destPath, filepath.Clean(destDir)+string(os.PathSeparator)) {
			return fmt.Errorf("illegal file path detected: %s", file.Name)
		}

		if err := extractFile(file, destPath); err != nil {
			return fmt.Errorf("failed to extract file %s: %w", file.Name, err)
		}
	}
	return nil
}

func extractFile(file *zip.File, destPath string) error {
	if err := os.MkdirAll(filepath.Dir(destPath), 0755); err != nil {
		return err
	}

	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = io.Copy(dst, src)
	return err
}
