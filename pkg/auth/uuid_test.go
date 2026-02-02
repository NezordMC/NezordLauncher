package auth

import (
	"testing"
)

func TestGenerateOfflineUUID(t *testing.T) {
	tests := []struct {
		username string
		expected string
	}{
		{
			username: "Steve",
			expected: "5627dd98-e6be-3c21-b8a8-e92344183641",
		},
		{
			username: "NezordPlayer",
			expected: "95ed5756-7437-34a8-ba02-97d534dd48a1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.username, func(t *testing.T) {
			got := GenerateOfflineUUID(tt.username)
			if got != tt.expected {
				t.Errorf("GenerateOfflineUUID(%s) = %s; want %s", tt.username, got, tt.expected)
			}
		})
	}
}

func TestConsistency(t *testing.T) {
	username := "RandomUser123"
	uuid1 := GenerateOfflineUUID(username)
	uuid2 := GenerateOfflineUUID(username)

	if uuid1 != uuid2 {
		t.Error("UUID generation is not deterministic")
	}
}
