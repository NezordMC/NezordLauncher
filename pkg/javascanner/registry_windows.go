package javascanner

import (
	"golang.org/x/sys/windows/registry"
)

func scanRegistryJava() ([]string, error) {
	var paths []string
	
	// Open the key for Java Runtime Environment
	k, err := registry.OpenKey(registry.LOCAL_MACHINE, `SOFTWARE\JavaSoft\Java Runtime Environment`, registry.READ)
	if err != nil {
		// Try JDK key if JRE not found
		k, err = registry.OpenKey(registry.LOCAL_MACHINE, `SOFTWARE\JavaSoft\Java Development Kit`, registry.READ)
		if err != nil {
			return nil, err
		}
	}
	defer k.Close()

	// Get subkeys (versions)
	versions, err := k.ReadSubKeyNames(-1)
	if err != nil {
		return nil, err
	}

	for _, v := range versions {
		verKey, err := registry.OpenKey(k, v, registry.READ)
		if err != nil {
			continue
		}
		
		javaHome, _, err := verKey.GetStringValue("JavaHome")
		verKey.Close()
		
		if err == nil && javaHome != "" {
			paths = append(paths, javaHome)
		}
	}

	return paths, nil
}
