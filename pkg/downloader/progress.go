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
	DownloadedBytes int64
	StartTime      time.Time
	mu             sync.Mutex
}

func NewProgress(totalFiles int) *DownloadProgress {
	return &DownloadProgress{
		TotalFiles: totalFiles,
		StartTime:  time.Now(),
	}
}

func (p *DownloadProgress) Increment(bytes int64) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.CompletedFiles++
	p.DownloadedBytes += bytes
}

func (p *DownloadProgress) AddTotal(count int) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.TotalFiles += count
}

func (p *DownloadProgress) GetStatus() string {
	p.mu.Lock()
	defer p.mu.Unlock()

	duration := time.Since(p.StartTime).Seconds()
	if duration == 0 {
		duration = 1
	}

	speed := float64(p.DownloadedBytes) / duration 
	
	percentage := float64(p.CompletedFiles) / float64(p.TotalFiles) * 100

	speedStr := formatBytes(speed) + "/s"
	
	return fmt.Sprintf("Downloading... %.1f%% (%d/%d) - %s", percentage, p.CompletedFiles, p.TotalFiles, speedStr)
}

func (p *DownloadProgress) GetCounts() (int, int) {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.CompletedFiles, p.TotalFiles
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
