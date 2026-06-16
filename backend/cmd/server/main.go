package main

import (
	"context"
	"log"
	"net"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"github.com/wahyutricahya/SIPBANSOS/backend/internal/auth"
	"github.com/wahyutricahya/SIPBANSOS/backend/internal/handler"
	"github.com/wahyutricahya/SIPBANSOS/backend/internal/server"
	"github.com/wahyutricahya/SIPBANSOS/backend/pkg/middleware"
)

func main() {
	_ = godotenv.Load()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:password@localhost:5432/sipbansos?sslmode=disable"
	}

	// Resolve hostname to IPv4 to avoid "no route to host" errors when DNS
	// resolves Supabase hostnames to IPv6 on networks without IPv6 routing.
	dsn = resolveToIPv4(dsn)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dbpool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatalf("failed to connect db: %v", err)
	}
	defer dbpool.Close()

	if err := os.MkdirAll("./uploads", 0755); err != nil {
		log.Fatalf("failed to create uploads directory: %v", err)
	}

	r := gin.Default()
	r.Static("/api/v1/uploads", "./uploads")

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dev-secret-change-me"
	}

	accessTTL := parseDurationEnv("JWT_ACCESS_TTL", "8h")
	refreshTTL := parseDurationEnv("JWT_REFRESH_TTL", "24h")
	jwtManager := auth.NewManager(jwtSecret, accessTTL, refreshTTL)

	h := handler.NewHandler(dbpool, jwtManager)
	authMiddleware := middleware.AuthMiddleware(jwtManager)
	server.RegisterRoutes(r, h, authMiddleware)

	addr := ":8080"
	if p := os.Getenv("PORT"); p != "" {
		addr = ":" + p
	}

	log.Printf("starting server on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server exited: %v", err)
	}
}

func parseDurationEnv(key string, fallback string) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		value = fallback
	}
	d, err := time.ParseDuration(value)
	if err != nil {
		d, _ = time.ParseDuration(fallback)
	}
	return d
}

// resolveToIPv4 parses the DSN, resolves the hostname to an IPv4 address,
// and returns a new DSN with the IPv4 address substituted in.
// Falls back to the original DSN if resolution fails.
func resolveToIPv4(dsn string) string {
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return dsn
	}

	host := config.ConnConfig.Host
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	addrs, err := net.DefaultResolver.LookupIP(ctx, "ip4", host)
	if err != nil || len(addrs) == 0 {
		log.Printf("warning: could not resolve %s to IPv4, using original: %v", host, err)
		return dsn
	}

	ipv4 := addrs[0].String()
	log.Printf("resolved %s → %s (IPv4)", host, ipv4)
	return strings.Replace(dsn, host, ipv4, 1)
}
