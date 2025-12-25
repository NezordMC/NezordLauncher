package javascanner

import (
	"fmt"
)


func SelectJava(installs []JavaInfo, mcVersion string) (*JavaInfo, error) {
	if len(installs) == 0 {
		return nil, fmt.Errorf("no java installations found")
	}

	
	reqMajor := 8
	if mcVersion >= "1.17" { 
		reqMajor = 17
	}
	if mcVersion >= "1.20.5" {
		reqMajor = 21
	}

	var best *JavaInfo
	
	for _, inst := range installs {
		candidate := inst
		
		if candidate.Major == reqMajor {
			best = &candidate
			break
		}
		
		
		if candidate.Major > reqMajor {
			if best == nil || (best.Major > candidate.Major) { 
				best = &candidate
			}
		}
	}
	
	
	if best == nil {
		for _, inst := range installs {
			candidate := inst
			if best == nil || candidate.Major > best.Major {
				best = &candidate
			}
		}
	}

	if best == nil {
		return nil, fmt.Errorf("failed to select java")
	}

	return best, nil
}
