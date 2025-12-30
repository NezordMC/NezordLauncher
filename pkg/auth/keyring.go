package auth

import (
	"errors"
	"fmt"

	"github.com/zalando/go-keyring"
)

const (
	serviceName = "NezordLauncher"
)

func SetSecureToken(username, tokenType, token string) error {
	key := fmt.Sprintf("%s:%s", username, tokenType)
	err := keyring.Set(serviceName, key, token)
	if err != nil {
		return fmt.Errorf("failed to set secure token: %w", err)
	}
	return nil
}

func GetSecureToken(username, tokenType string) (string, error) {
	key := fmt.Sprintf("%s:%s", username, tokenType)
	token, err := keyring.Get(serviceName, key)
	if errors.Is(err, keyring.ErrNotFound) {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("failed to get secure token: %w", err)
	}
	return token, nil
}

func DeleteSecureToken(username, tokenType string) error {
	key := fmt.Sprintf("%s:%s", username, tokenType)
	err := keyring.Delete(serviceName, key)
	if errors.Is(err, keyring.ErrNotFound) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("failed to delete secure token: %w", err)
	}
	return nil
}
