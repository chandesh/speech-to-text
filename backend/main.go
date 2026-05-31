package main

import (
	"log"

	"github.com/chandesh/speech-to-text/backend/core/config"
)

func main() {
	cfg := config.Load()
	log.Printf("Starting server on port %s", cfg.Port)
}
