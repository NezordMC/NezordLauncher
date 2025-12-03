package downloader

import (
	// "NezordLauncher/pkg/constants"
	"os"
	"testing"
)

func TestArtifactFetcher(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	// Setup direktori temp untuk tes agar tidak mengotori sistem
	tempHome := t.TempDir()
	os.Setenv("APPDATA", tempHome) // Mock untuk Windows logic
	// Untuk Linux logic di constants.go, kita mungkin butuh teknik lain atau mock function,
	// tapi untuk integration test sederhana, biarkan dia menulis ke folder tes jika memungkinkan
	// atau skip tes path production.

	pool := NewWorkerPool(5, 100)
	fetcher := NewArtifactFetcher(pool)
	pool.Start()

	// Coba fetch versi tua yang ringan (misal 1.0) atau hanya manifest
	// Disini kita hanya cek apakah manifest bisa diambil
	manifest, err := fetcher.fetchManifest()
	if err != nil {
		t.Fatalf("Failed to fetch manifest: %v", err)
	}

	if len(manifest.Versions) == 0 {
		t.Error("Manifest versions is empty")
	}

	t.Logf("Successfully fetched manifest. Latest Release: %s", manifest.Latest.Release)
	
	// STOP disini untuk unit test. Jangan download full game saat test unit (terlalu besar).
	// Full download test dilakukan di Commit 12 (Integration).
	pool.Wait()
}
