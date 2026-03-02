//go:build windows

package javascanner

import (
	"os/exec"
	"syscall"
)

func setCommandNoWindow(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{
		HideWindow:    true,
		CreationFlags: 0x08000000, // CREATE_NO_WINDOW
	}
}
