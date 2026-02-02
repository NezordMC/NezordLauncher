package network

import (
	"NezordLauncher/pkg/constants"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestUserAgentAndConnection(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ua := r.Header.Get("User-Agent")
		if !strings.Contains(ua, constants.AppName) {
			t.Errorf("Incorrect User-Agent: %s", ua)
		}
		if !strings.Contains(ua, "linux") && !strings.Contains(ua, "windows") {
			t.Errorf("User-Agent does not contain OS info: %s", ua)
		}
		fmt.Fprintln(w, "Hello, client")
	}))
	defer ts.Close()

	client := NewHttpClient()
	body, err := client.Get(ts.URL)
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}

	if string(body) != "Hello, client\n" {
		t.Errorf("Response body mismatch")
	}
}

func TestRealConnectionToMojang(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping real connection test in short mode")
	}

	client := NewHttpClient()
	_, err := client.Get(constants.VersionManifestV2URL)
	if err != nil {
		t.Logf("Failed to connect to Mojang (might be offline): %v", err)
	} else {
		t.Log("Successfully connected to Mojang server")
	}
}
