package auth

import (
	"NezordLauncher/pkg/network"
	"encoding/json"
	"fmt"
	"os"
)

const ElyByAuthURL = "https://authserver.ely.by/auth/authenticate"

type AuthPayload struct {
	Agent       Agent  `json:"agent"`
	Username    string `json:"username"`
	Password    string `json:"password"`
	ClientToken string `json:"clientToken,omitempty"`
	RequestUser bool   `json:"requestUser"`
}

type Agent struct {
	Name    string `json:"name"`
	Version int    `json:"version"`
}

type AuthResponse struct {
	AccessToken       string    `json:"accessToken"`
	ClientToken       string    `json:"clientToken"`
	SelectedProfile   Profile   `json:"selectedProfile"`
	AvailableProfiles []Profile `json:"availableProfiles"`
	User              User      `json:"user"`
}

type Profile struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type User struct {
	ID string `json:"id"`
}

func AuthenticateElyBy(username, password string) (*AuthResponse, error) {
	authURL := os.Getenv("NEZORD_ELYBY_AUTH_URL")
	if authURL == "" {
		authURL = ElyByAuthURL
	}
	payload := AuthPayload{
		Agent: Agent{
			Name:    "Minecraft",
			Version: 1,
		},
		Username:    username,
		Password:    password,
		RequestUser: true,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal auth payload: %w", err)
	}

	client := network.NewHttpClient()
	responseBytes, err := client.PostJSON(authURL, body)
	if err != nil {
		return nil, fmt.Errorf("authentication failed: %w", err)
	}

	var resp AuthResponse
	if err := json.Unmarshal(responseBytes, &resp); err != nil {
		return nil, fmt.Errorf("failed to parse auth response: %w", err)
	}

	return &resp, nil
}
