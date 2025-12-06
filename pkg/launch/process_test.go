package launch

import (
	"strings"
	"testing"
)

func TestExecuteGame(t *testing.T) {
	var capturedLogs []string
	
	logger := func(text string) {
		capturedLogs = append(capturedLogs, text)
	}

	cmd := "echo"
	args := []string{"Nezord Launcher Launch Test"}
	dir := "/tmp"

	err := ExecuteGame(cmd, args, dir, logger)
	if err != nil {
		t.Fatalf("Process execution failed: %v", err)
	}

	found := false
	for _, log := range capturedLogs {
		if strings.Contains(log, "Nezord Launcher Launch Test") {
			found = true
			break
		}
	}

	if !found {
		t.Errorf("Expected output not found in logs. Logs: %v", capturedLogs)
	}
	
	t.Logf("Total logs captured: %d", len(capturedLogs))
}
