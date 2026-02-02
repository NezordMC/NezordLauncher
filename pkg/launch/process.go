package launch

import (
	"bufio"
	"fmt"
	"io"
	"os/exec"
	"sync"
)

type LogCallback func(text string)

// Launch is implemented in platform specific files

func Monitor(cmd *exec.Cmd, onLog LogCallback) error {
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to create stdout pipe: %w", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to create stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start game process: %w", err)
	}

	if onLog != nil {
		onLog(fmt.Sprintf("Process started with PID: %d", cmd.Process.Pid))
	}

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		streamLog(stdout, onLog, "[GAME]")
	}()

	go func() {
		defer wg.Done()
		streamLog(stderr, onLog, "[ERROR]")
	}()

	wg.Wait()

	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("game process exited with error: %w", err)
	}

	if onLog != nil {
		onLog("Process exited successfully")
	}

	return nil
}

// Deprecated: Use Launch and Monitor instead
func ExecuteGame(command string, args []string, dir string, onLog LogCallback) error {
	cmd, _ := Launch(command, args, dir, nil)
	return Monitor(cmd, onLog)
}

func streamLog(pipe io.ReadCloser, callback LogCallback, prefix string) {
	scanner := bufio.NewScanner(pipe)
	for scanner.Scan() {
		text := scanner.Text()
		if callback != nil {
			callback(fmt.Sprintf("%s %s", prefix, text))
		}
	}
}
