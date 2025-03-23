FROM golang:1.24 AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o server ./cmd/server/main.go

# Add wait-for-it script to handle database connection timing
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

FROM alpine:3.18
RUN apk --no-cache add ca-certificates bash
WORKDIR /root/
COPY --from=builder /app/server .
COPY --from=builder /wait-for-it.sh /wait-for-it.sh

# Copy assets folder for default profile picture
COPY --from=builder /app/assets /root/assets

EXPOSE 8080
ENTRYPOINT ["/bin/bash", "-c", "/wait-for-it.sh postgres:5432 -t 60 -- ./server"]
