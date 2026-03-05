package main

import (
	"NezordLauncher/pkg/auth"
	"NezordLauncher/pkg/validation"
	"fmt"
)

func (a *App) GetAccounts() []auth.Account {
	return a.accountManager.GetAccounts()
}

func (a *App) AddOfflineAccount(username string) (*auth.Account, error) {
	if err := validation.ValidateUsername(username); err != nil {
		return nil, err
	}
	return a.accountManager.AddOfflineAccount(username)
}

func (a *App) LoginElyBy(username, password string) (*auth.Account, error) {
	if username == "" || password == "" {
		return nil, fmt.Errorf("username and password required")
	}
	return a.accountManager.AddElyByAccount(username, password)
}

func (a *App) SetActiveAccount(uuid string) error {
	if err := validation.ValidateUUID(uuid); err != nil {
		return err
	}
	return a.accountManager.SetActiveAccount(uuid)
}

func (a *App) GetActiveAccount() *auth.Account {
	return a.accountManager.GetActiveAccount()
}

func (a *App) RemoveAccount(uuid string) error {
	if err := validation.ValidateUUID(uuid); err != nil {
		return err
	}
	return a.accountManager.RemoveAccount(uuid)
}
