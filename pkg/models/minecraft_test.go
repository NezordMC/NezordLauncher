package models

import (
	"encoding/json"
	"testing"
)

func TestArgumentParsing(t *testing.T) {
	jsonData := []byte(`{
		"arguments": {
			"game": [
				"--demo",
				{
					"rules": [
						{ "action": "allow", "os": { "name": "osx" } }
					],
					"value": "--width"
				},
				{
					"rules": [
						{ "action": "allow", "os": { "name": "linux" } }
					],
					"value": ["--fullscreen", "--width"]
				}
			],
			"jvm": []
		}
	}`)

	var detail VersionDetail
	if err := json.Unmarshal(jsonData, &detail); err != nil {
		t.Fatalf("Failed to unmarshal JSON: %v", err)
	}

	if len(detail.Arguments.Game) != 3 {
		t.Errorf("Expected 3 game arguments, got %d", len(detail.Arguments.Game))
	}

	if len(detail.Arguments.Game[0].Values) != 1 || detail.Arguments.Game[0].Values[0] != "--demo" {
		t.Error("Failed to parse simple string argument")
	}
	if len(detail.Arguments.Game[1].Values) != 1 || detail.Arguments.Game[1].Values[0] != "--width" {
		t.Error("Failed to parse object argument with single string value")
	}

	if len(detail.Arguments.Game[2].Values) != 2 {
		t.Error("Failed to parse object argument with array value")
	}
}
