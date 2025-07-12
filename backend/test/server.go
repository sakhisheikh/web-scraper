package main

import (
	"log"
	"net/http"
)

func main() {
	// This line tells the server to serve files from the current directory (where server.go is)
	// http.FileServer(http.Dir(".")) serves files relative to where the command is run.
	// For your test, you'd put test_page_with_broken_links.html in the same directory as server.go
	fs := http.FileServer(http.Dir("."))

	// Register the file server to handle all requests
	http.Handle("/", fs)

	// Start the server on port 8000
	log.Println("Serving files from current directory on http://localhost:8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
