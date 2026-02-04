//go:build !windows

package javascanner

func scanRegistryJava() ([]string, error) {
	return nil, nil
}
