package downloader

import (
	"NezordLauncher/pkg/network"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
)

func downloadWithResume(ctx context.Context, client *network.HttpClient, url, partPath string) (int64, error) {
	offset := int64(0)
	if info, err := os.Stat(partPath); err == nil {
		offset = info.Size()
	}

	for attempt := 0; attempt < 2; attempt++ {
		req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
		if err != nil {
			return 0, err
		}
		if offset > 0 {
			req.Header.Set("Range", fmt.Sprintf("bytes=%d-", offset))
		}

		resp, err := client.Do(req)
		if err != nil {
			return 0, err
		}

		if resp.StatusCode == http.StatusRequestedRangeNotSatisfiable {
			resp.Body.Close()
			if err := os.Remove(partPath); err != nil && !os.IsNotExist(err) {
				return 0, err
			}
			offset = 0
			continue
		}

		if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusPartialContent {
			resp.Body.Close()
			return 0, fmt.Errorf("unexpected status %d", resp.StatusCode)
		}

		flags := os.O_CREATE | os.O_WRONLY
		if resp.StatusCode == http.StatusPartialContent && offset > 0 {
			flags |= os.O_APPEND
		} else {
			flags |= os.O_TRUNC
			offset = 0
		}

		f, err := os.OpenFile(partPath, flags, 0644)
		if err != nil {
			resp.Body.Close()
			return 0, err
		}

		n, err := io.Copy(f, resp.Body)
		closeErr := f.Close()
		resp.Body.Close()
		if err != nil {
			return 0, err
		}
		if closeErr != nil {
			return 0, closeErr
		}

		return n, nil
	}

	return 0, fmt.Errorf("range not satisfiable")
}
