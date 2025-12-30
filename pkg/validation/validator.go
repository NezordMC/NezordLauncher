package validation

import (
	"fmt"
	"regexp"
	"strings"
)

var (
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]{3,16}$`)
	instanceNameRegex = regexp.MustCompile(`^[a-zA-Z0-9\-_ ]{1,50}$`)
	versionRegex = regexp.MustCompile(`^[a-zA-Z0-9\._\-]+$`)
	uuidRegex = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)
)

func ValidateUsername(username string) error {
	if !usernameRegex.MatchString(username) {
		return fmt.Errorf("invalid username: must be 3-16 alphanumeric characters or underscore")
	}
	return nil
}

func ValidateInstanceName(name string) error {
	if strings.TrimSpace(name) == "" {
		return fmt.Errorf("instance name cannot be empty")
	}
	if !instanceNameRegex.MatchString(name) {
		return fmt.Errorf("invalid instance name: allow only alphanumeric, dash, underscore, and space (max 50 chars)")
	}
	return nil
}

func ValidateVersionID(version string) error {
	if !versionRegex.MatchString(version) {
		return fmt.Errorf("invalid version ID format")
	}
	return nil
}

func ValidateUUID(uuid string) error {
	if !uuidRegex.MatchString(uuid) {
		return fmt.Errorf("invalid UUID format")
	}
	return nil
}
