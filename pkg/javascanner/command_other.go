//go:build !windows

package javascanner

import "os/exec"

func setCommandNoWindow(cmd *exec.Cmd) {}
