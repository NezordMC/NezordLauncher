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

	cmdObj, err := Launch(cmd, args, dir, nil)
	if err != nil {
		t.Fatalf("Launch failed: %v", err)
	}

	err = Monitor(cmdObj, logger)
	if err != nil {
		t.Fatalf("Monitor failed: %v", err)
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
