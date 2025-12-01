package network

import (
	"fmt"
	"io"
	"net"
	"net/http"
	"NezordLauncher/pkg/constants"
	"NezordLauncher/pkg/system"
	"time"
)

const (
	DefaultTimeout = 30 * time.Second
	ConnectTimeout = 10 * time.Second
	KeepAlive      = 30 * time.Second
)

type HttpClient struct {
	client *http.Client
}

func NewHttpClient() *HttpClient {
	transport := &http.Transport{
		DialContext: (&net.Dialer{
			Timeout:   ConnectTimeout,
			KeepAlive: KeepAlive,
		}).DialContext,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          100,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}

	return &HttpClient{
		client: &http.Client{
			Transport: transport,
			Timeout:   DefaultTimeout,
		},
	}
}

func (c *HttpClient) Get(url string) ([]byte, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	sysInfo := system.GetSystemInfo()
	userAgent := fmt.Sprintf("%s/1.0.0 (%s; %s)", constants.AppName, sysInfo.OS, sysInfo.Arch)
	req.Header.Set("User-Agent", userAgent)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("request failed with status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}
