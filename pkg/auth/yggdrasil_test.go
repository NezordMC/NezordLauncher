package auth

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestAuthenticateElyBy_Mock(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/auth/authenticate" {
			t.Errorf("Expected path /auth/authenticate, got %s", r.URL.Path)
		}
		if r.Method != "POST" {
			t.Errorf("Expected POST, got %s", r.Method)
		}

		resp := AuthResponse{
			AccessToken: "mock-access-token",
			ClientToken: "mock-client-token",
			SelectedProfile: Profile{
				ID:   "mock-uuid",
				Name: "NezordElyUser",
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	originalURL := os.Getenv("NEZORD_ELYBY_AUTH_URL")
	os.Setenv("NEZORD_ELYBY_AUTH_URL", server.URL+"/auth/authenticate")
	defer os.Setenv("NEZORD_ELYBY_AUTH_URL", originalURL)

	resp, err := AuthenticateElyBy("user", "pass")
	if err != nil {
		t.Fatalf("AuthenticateElyBy failed: %v", err)
	}
	if resp.AccessToken != "mock-access-token" {
		t.Fatalf("AccessToken mismatch")
	}
}

func TestAuthPayload_Marshal(t *testing.T) {
	payload := AuthPayload{
		Username: "test",
		Password: "password",
	}

	data, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("Failed to marshal: %v", err)
	}

	s := string(data)
	if len(s) == 0 {
		t.Error("Empty JSON")
	}
}
