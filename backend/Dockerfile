FROM golang:1.20-alpine AS build
WORKDIR /app
COPY go.mod .
COPY . .
RUN apk add --no-cache git gcc musl-dev
RUN go build -o /usr/local/bin/sipbansos ./cmd/server

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=build /usr/local/bin/sipbansos /usr/local/bin/sipbansos
EXPOSE 8080
CMD ["/usr/local/bin/sipbansos"]
