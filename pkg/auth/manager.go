package auth

import (
	"NezordLauncher/pkg/constants"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

type AccountType string

const (
	AccountTypeOffline   AccountType = "offline"
	AccountTypeElyBy     AccountType = "elyby"
	AccountTypeMicrosoft AccountType = "microsoft"
)

type Account struct {
	UUID           string        `json:"uuid"`
	Username       string        `json:"username"`
	Type           AccountType   `json:"type"`
	AccessToken    string        `json:"-"`
	ClientToken    string        `json:"-"`
	UserProperties []interface{} `json:"userProperties,omitempty"`
}

type AccountData struct {
	Accounts   []Account `json:"accounts"`
	ActiveUUID string    `json:"activeUUID"`
}

type AccountManager struct {
	mu       sync.RWMutex
	filePath string
	Data     AccountData
}

func NewAccountManager() *AccountManager {
	return &AccountManager{
		filePath: filepath.Join(constants.GetConfigDir(), "accounts.json"),
		Data: AccountData{
			Accounts: []Account{},
		},
	}
}

func (m *AccountManager) Load() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if err := os.MkdirAll(filepath.Dir(m.filePath), 0755); err != nil {
		return err
	}

	data, err := os.ReadFile(m.filePath)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("failed to read accounts file: %w", err)
	}

	if err := json.Unmarshal(data, &m.Data); err != nil {
		return err
	}

	for i := range m.Data.Accounts {
		acc := &m.Data.Accounts[i]
		if acc.Type != AccountTypeOffline {
			key := tokenKey(*acc)
			at, _ := GetSecureToken(key, "AccessToken")
			ct, _ := GetSecureToken(key, "ClientToken")
			if at == "" && acc.Username != "" && acc.Username != key {
				at, _ = GetSecureToken(acc.Username, "AccessToken")
				ct, _ = GetSecureToken(acc.Username, "ClientToken")
				if at != "" || ct != "" {
					_ = SetSecureToken(key, "AccessToken", at)
					_ = SetSecureToken(key, "ClientToken", ct)
					_ = DeleteSecureToken(acc.Username, "AccessToken")
					_ = DeleteSecureToken(acc.Username, "ClientToken")
				}
			}
			acc.AccessToken = at
			acc.ClientToken = ct
		}
	}

	return nil
}

func (m *AccountManager) saveInternal() error {
	dir := filepath.Dir(m.filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	for _, acc := range m.Data.Accounts {
		if acc.Type != AccountTypeOffline && acc.AccessToken != "" {
			key := tokenKey(acc)
			_ = SetSecureToken(key, "AccessToken", acc.AccessToken)
			_ = SetSecureToken(key, "ClientToken", acc.ClientToken)
		}
	}

	data, err := json.MarshalIndent(m.Data, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal accounts: %w", err)
	}
	return os.WriteFile(m.filePath, data, 0644)
}

func (m *AccountManager) AddOfflineAccount(username string) (*Account, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	uuid := GenerateOfflineUUID(username)

	for _, acc := range m.Data.Accounts {
		if acc.UUID == uuid {
			m.Data.ActiveUUID = uuid
			m.saveInternal()
			accCopy := acc
			return &accCopy, nil
		}
	}

	newAcc := Account{
		UUID:        uuid,
		Username:    username,
		Type:        AccountTypeOffline,
		AccessToken: "null",
		ClientToken: "null",
	}

	m.Data.Accounts = append(m.Data.Accounts, newAcc)
	m.Data.ActiveUUID = uuid

	if err := m.saveInternal(); err != nil {
		return nil, err
	}

	return &newAcc, nil
}

func (m *AccountManager) GetActiveAccount() *Account {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if m.Data.ActiveUUID == "" {
		if len(m.Data.Accounts) > 0 {
			acc := m.Data.Accounts[0]
			return &acc
		}
		return nil
	}

	for _, acc := range m.Data.Accounts {
		if acc.UUID == m.Data.ActiveUUID {
			accCopy := acc
			return &accCopy
		}
	}

	if len(m.Data.Accounts) > 0 {
		acc := m.Data.Accounts[0]
		return &acc
	}

	return nil
}

func (m *AccountManager) SetActiveAccount(uuid string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	found := false
	for _, acc := range m.Data.Accounts {
		if acc.UUID == uuid {
			found = true
			break
		}
	}

	if !found {
		return fmt.Errorf("account with uuid %s not found", uuid)
	}

	m.Data.ActiveUUID = uuid
	return m.saveInternal()
}

func (m *AccountManager) GetAccounts() []Account {
	m.mu.RLock()
	defer m.mu.RUnlock()

	result := make([]Account, len(m.Data.Accounts))
	copy(result, m.Data.Accounts)
	return result
}

func (m *AccountManager) AddElyByAccount(username, password string) (*Account, error) {
	resp, err := AuthenticateElyBy(username, password)
	if err != nil {
		return nil, err
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	uuid := resp.SelectedProfile.ID
	displayName := resp.SelectedProfile.Name

	for i, acc := range m.Data.Accounts {
		if acc.UUID == uuid {
			m.Data.Accounts[i].Username = displayName
			m.Data.Accounts[i].AccessToken = resp.AccessToken
			m.Data.Accounts[i].ClientToken = resp.ClientToken
			m.Data.Accounts[i].Type = AccountTypeElyBy

			m.Data.ActiveUUID = uuid
			m.saveInternal()

			accCopy := m.Data.Accounts[i]
			return &accCopy, nil
		}
	}

	newAcc := Account{
		UUID:        uuid,
		Username:    displayName,
		Type:        AccountTypeElyBy,
		AccessToken: resp.AccessToken,
		ClientToken: resp.ClientToken,
	}

	m.Data.Accounts = append(m.Data.Accounts, newAcc)
	m.Data.ActiveUUID = uuid

	if err := m.saveInternal(); err != nil {
		return nil, err
	}

	return &newAcc, nil
}

func (m *AccountManager) RemoveAccount(uuid string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	foundIndex := -1
	for i, acc := range m.Data.Accounts {
		if acc.UUID == uuid {
			foundIndex = i
			break
		}
	}

	if foundIndex == -1 {
		return fmt.Errorf("account not found")
	}

	targetUsername := m.Data.Accounts[foundIndex].Username
	targetKey := tokenKey(m.Data.Accounts[foundIndex])
	m.Data.Accounts = append(m.Data.Accounts[:foundIndex], m.Data.Accounts[foundIndex+1:]...)

	if m.Data.ActiveUUID == uuid {
		m.Data.ActiveUUID = ""
		if len(m.Data.Accounts) > 0 {
			m.Data.ActiveUUID = m.Data.Accounts[0].UUID
		}
	}

	if targetKey != "" {
		_ = DeleteSecureToken(targetKey, "AccessToken")
		_ = DeleteSecureToken(targetKey, "ClientToken")
	}
	if targetUsername != "" && targetUsername != targetKey {
		_ = DeleteSecureToken(targetUsername, "AccessToken")
		_ = DeleteSecureToken(targetUsername, "ClientToken")
	}

	return m.saveInternal()
}

func tokenKey(acc Account) string {
	if acc.UUID != "" {
		return acc.UUID
	}
	return acc.Username
}
