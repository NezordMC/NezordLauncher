//go:build windows

package launch

import (
	"fmt"
	"os"
	"os/exec"
	"syscall"
)

func Launch(command string, args []string, dir string, env map[string]string) (*exec.Cmd, error) {
	cmd := exec.Command(command, args...)
	cmd.Dir = dir

	cmd.SysProcAttr = &syscall.SysProcAttr{
		HideWindow:    true,
		CreationFlags: 0x08000000, // CREATE_NO_WINDOW
	}

	if len(env) > 0 {
		cmd.Env = os.Environ()
		for k, v := range env {
			cmd.Env = append(cmd.Env, fmt.Sprintf("%s=%s", k, v))
		}
	}
	return cmd, nil
}
