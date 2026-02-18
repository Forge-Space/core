BINARY_NAME=myapp
VERSION?=dev
LDFLAGS=-ldflags "-X cmd.Version=$(VERSION)"

.PHONY: build test lint clean install

build:
	go build $(LDFLAGS) -o bin/$(BINARY_NAME) .

test:
	go test ./... -v -race -coverprofile=coverage.out
	go tool cover -func=coverage.out

lint:
	golangci-lint run ./...

clean:
	rm -rf bin/ coverage.out

install:
	go install $(LDFLAGS) .

release:
	goreleaser release --clean
