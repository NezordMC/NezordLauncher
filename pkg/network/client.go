package network

import (
	"NezordLauncher/pkg/constants"
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
	return fmt.Sprintf("NezordLauncher/%s (%s; %s)", constants.Version, runtime.GOOS, runtime.GOARCH)
}

func (c *HttpClient) doGet(url string) ([]byte, int, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("User-Agent", c.getUserAgent())

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, err
	}

	return body, resp.StatusCode, nil
}

func (c *HttpClient) Get(url string) ([]byte, error) {
	var lastErr error
	maxRetries := 3

	for i := 0; i < maxRetries; i++ {
		if i > 0 {
			time.Sleep(time.Duration(math.Pow(2, float64(i))) * time.Second)
		}

		body, statusCode, err := c.doGet(url)
		if err != nil {
			lastErr = err
			continue
		}

		if statusCode != http.StatusOK {
			lastErr = fmt.Errorf("request failed with status: %d", statusCode)
			if statusCode >= 500 {
				continue
			}
			return nil, lastErr
		}

		return body, nil
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
