package logging

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

var (
	logFile     *os.File
	mu          sync.Mutex
	initialized bool
	logCallback func(Level, string)
)

type Level int

const (
	DEBUG Level = iota
	INFO
	WARN
	ERROR
)

func (l Level) String() string {
	switch l {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARN:
		return "WARN"
	case ERROR:
		return "ERROR"
	default:
		return "UNKNOWN"
	}
}

func Init(logDir string) error {
	mu.Lock()
	defer mu.Unlock()

	if initialized {
		return nil
	}

	if err := os.MkdirAll(logDir, 0755); err != nil {
		return err
	}

	rotateLogs(logDir, "launcher.log", 5)

	path := filepath.Join(logDir, "launcher.log")
	f, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	logFile = f
	initialized = true
	
	backgroundLog(INFO, "Logger initialized")
	return nil
}

func Close() {
	mu.Lock()
	defer mu.Unlock()
	if logFile != nil {
		logFile.Close()
		logFile = nil
	}
}

func backgroundLog(level Level, format string, args ...interface{}) {
	msg := fmt.Sprintf(format, args...)
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	line := fmt.Sprintf("[%s] [%s] %s\n", timestamp, level, msg)

	if logFile != nil {
		logFile.WriteString(line)
	}
	fmt.Print(line)

	if logCallback != nil {
		logCallback(level, msg)
	}
}

func SetCallback(fn func(Level, string)) {
	mu.Lock()
	defer mu.Unlock()
	logCallback = fn
}

func Log(level Level, format string, args ...interface{}) {
	mu.Lock()
	defer mu.Unlock()
	backgroundLog(level, format, args...)
}

func Info(format string, args ...interface{}) { Log(INFO, format, args...) }
func Error(format string, args ...interface{}) { Log(ERROR, format, args...) }
func Warn(format string, args ...interface{}) { Log(WARN, format, args...) }
func Debug(format string, args ...interface{}) { Log(DEBUG, format, args...) }
