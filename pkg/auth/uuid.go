package auth

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
)

func GenerateOfflineUUID(username string) string {
	data := []byte("OfflinePlayer:" + username)
	hash := md5.Sum(data)

	hash[6] = (hash[6] & 0x0f) | 0x30
	hash[8] = (hash[8] & 0x3f) | 0x80

	uuidStr := hex.EncodeToString(hash[:])
	
	return fmt.Sprintf("%s-%s-%s-%s-%s",
		uuidStr[0:8],
		uuidStr[8:12],
		uuidStr[12:16],
		uuidStr[16:20],
		uuidStr[20:],
	)
}
