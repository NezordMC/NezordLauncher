package downloader

type Task struct {
	URL  string
	Path string
	SHA1 string
	Size int64
}
