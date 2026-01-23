package javascanner

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

func SelectJava(installs []JavaInfo, mcVersion string) (*JavaInfo, error) {
	if len(installs) == 0 {
		return nil, fmt.Errorf("no java installations found")
	}

	reqMajor := getRequiredJavaMajor(mcVersion)

	var best *JavaInfo

	for _, inst := range installs {
		candidate := inst
		if candidate.Major == reqMajor {
			if best == nil || compareJavaVersion(candidate.Version, best.Version) > 0 {
				best = &candidate
			}
		}

		if candidate.Major > reqMajor && best == nil {
			best = &candidate
		}
	}

	if best == nil {
		for _, inst := range installs {
			candidate := inst
			if candidate.Major > reqMajor {
				if best == nil || candidate.Major < best.Major || (candidate.Major == best.Major && compareJavaVersion(candidate.Version, best.Version) > 0) {
					best = &candidate
				}
			}
		}
	}

	if best == nil {
		for _, inst := range installs {
			candidate := inst
			if best == nil || candidate.Major > best.Major || (candidate.Major == best.Major && compareJavaVersion(candidate.Version, best.Version) > 0) {
				best = &candidate
			}
		}
	}

	if best == nil {
		return nil, fmt.Errorf("failed to select java")
	}

	return best, nil
}

func getRequiredJavaMajor(mcVersion string) int {
	v, ok := parseMinecraftVersion(mcVersion)
	if !ok {
		return 17
	}
	if v.major != 1 {
		return 17
	}
	if v.minor < 17 {
		return 8
	}
	if v.minor > 20 {
		return 21
	}
	if v.minor == 20 {
		if v.patch >= 5 {
			return 21
		}
		return 17
	}
	return 17
}

type mcVersion struct {
	major int
	minor int
	patch int
}

func parseMinecraftVersion(version string) (mcVersion, bool) {
	trimmed := version
	for _, sep := range []string{"-", "+"} {
		if idx := strings.Index(trimmed, sep); idx >= 0 {
			trimmed = trimmed[:idx]
		}
	}
	parts := strings.Split(trimmed, ".")
	if len(parts) < 2 {
		return mcVersion{}, false
	}
	major, err := strconv.Atoi(parts[0])
	if err != nil {
		return mcVersion{}, false
	}
	minor, err := strconv.Atoi(parts[1])
	if err != nil {
		return mcVersion{}, false
	}
	patch := 0
	if len(parts) > 2 {
		p, err := strconv.Atoi(parts[2])
		if err != nil {
			return mcVersion{}, false
		}
		patch = p
	}
	return mcVersion{major: major, minor: minor, patch: patch}, true
}

func compareJavaVersion(a, b string) int {
	na := parseJavaNumbers(a)
	nb := parseJavaNumbers(b)
	max := len(na)
	if len(nb) > max {
		max = len(nb)
	}
	for i := 0; i < max; i++ {
		av := 0
		if i < len(na) {
			av = na[i]
		}
		bv := 0
		if i < len(nb) {
			bv = nb[i]
		}
		if av > bv {
			return 1
		}
		if av < bv {
			return -1
		}
	}
	return 0
}

func parseJavaNumbers(version string) []int {
	re := regexp.MustCompile(`\d+`)
	matches := re.FindAllString(version, -1)
	result := make([]int, 0, len(matches))
	for _, m := range matches {
		v, err := strconv.Atoi(m)
		if err != nil {
			continue
		}
		result = append(result, v)
	}
	return result
}
