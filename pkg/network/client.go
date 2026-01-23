package network

import (
	"bytes"
	"fmt"
	"io"
	"math"
	"net/http"
	"runtime"
	"time"
)

type HttpClient struct {
	client *http.Client
}

func NewHttpClient() *HttpClient {
	t := &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 20,
		IdleConnTimeout:     90 * time.Second,
	}

	return &HttpClient{
		client: &http.Client{
			Transport: t,
			Timeout:   30 * time.Second,
		},
	}
}

func (c *HttpClient) getUserAgent() string {
	return fmt.Sprintf("NezordLauncher/1.0 (%s; %s)", runtime.GOOS, runtime.GOARCH)
}

func (c *HttpClient) Get(url string) ([]byte, error) {
	var lastErr error
	maxRetries := 3

	for i := 0; i < maxRetries; i++ {
		if i > 0 {
			time.Sleep(time.Duration(math.Pow(2, float64(i))) * time.Second)
		}

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, err
		}

		req.Header.Set("User-Agent", c.getUserAgent())

		resp, err := c.client.Do(req)
		if err != nil {
			lastErr = err
			continue
		}

		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			lastErr = fmt.Errorf("request failed with status: %d", resp.StatusCode)
			if resp.StatusCode >= 500 {
				continue
			}
			return nil, lastErr
		}

		return io.ReadAll(resp.Body)
	}

	return nil, lastErr
}

func (c *HttpClient) PostJSON(url string, body []byte) ([]byte, error) {
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", c.getUserAgent())

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(data))
	}

	return data, nil
}

func (c *HttpClient) Do(req *http.Request) (*http.Response, error) {
	if req.Header.Get("User-Agent") == "" {
		req.Header.Set("User-Agent", c.getUserAgent())
	}
	return c.client.Do(req)
}
