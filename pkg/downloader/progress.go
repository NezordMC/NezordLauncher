package downloader

import (
	"fmt"
	"sync"
	"time"
)

type DownloadProgress struct {
	TotalFiles     int
	CompletedFiles int
	TotalBytes     int64
	CurrentBytes   int64 // Bytes of files processed (downloaded or verified)
	NetworkBytes   int64 // Bytes actually downloaded from network
	StartTime      time.Time
	mu             sync.Mutex
}

func NewProgress(totalFiles int) *DownloadProgress {
	return &DownloadProgress{
		TotalFiles: totalFiles,
		StartTime:  time.Now(),
	}
}

func (p *DownloadProgress) Increment(size int64, network int64) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.CompletedFiles++
	p.CurrentBytes += size
	p.NetworkBytes += network
}

func (p *DownloadProgress) AddTotal(count int, size int64) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.TotalFiles += count
	p.TotalBytes += size
}

func (p *DownloadProgress) GetStatus() string {
	p.mu.Lock()
	defer p.mu.Unlock()

	duration := time.Since(p.StartTime).Seconds()
	if duration == 0 {
		duration = 1
	}

	speed := float64(p.NetworkBytes) / duration
	percentage := 0.0
	if p.TotalBytes > 0 {
		percentage = float64(p.CurrentBytes) / float64(p.TotalBytes) * 100
	} else if p.TotalFiles > 0 {
		percentage = float64(p.CompletedFiles) / float64(p.TotalFiles) * 100
	}

	speedStr := formatBytes(speed) + "/s"
	return fmt.Sprintf("Downloading... %.1f%% - %s", percentage, speedStr)
}

func (p *DownloadProgress) GetMetrics() (int, int, int64, int64, float64, float64) {
	p.mu.Lock()
	defer p.mu.Unlock()

	duration := time.Since(p.StartTime).Seconds()
	if duration == 0 {
		duration = 1
	}

	speed := float64(p.NetworkBytes) / duration

	eta := 0.0
	if speed > 0 && p.TotalBytes > p.CurrentBytes {
		remaining := float64(p.TotalBytes - p.CurrentBytes)
		eta = remaining / speed
	}

	return p.CompletedFiles, p.TotalFiles, p.CurrentBytes, p.TotalBytes, speed, eta
}

func formatBytes(bytes float64) string {
	units := []string{"B", "KB", "MB", "GB"}
	i := 0
	for bytes >= 1024 && i < len(units)-1 {
		bytes /= 1024
		i++
	}
	return fmt.Sprintf("%.2f %s", bytes, units[i])
}
