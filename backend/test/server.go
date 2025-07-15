package main

import (
	"log"
	"net/http"
)

func main() {

	fs := http.FileServer(http.Dir("."))

	http.Handle("/", fs)

	// Start the server on port 8000
	log.Println("Serving files from current directory on http://localhost:8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
