FROM golang:1.24 as builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o server ./cmd/server/main.go

FROM alpine:3.18
RUN apk --no-cache add ca-certificates=20230126-r0
WORKDIR /root/
COPY --from=builder /app/server .

EXPOSE 8080
CMD ["./server"]
