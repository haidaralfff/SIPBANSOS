// Package handler provides the Vercel serverless function entry point for the
// SIPBANSOS Go/Gin backend. Vercel discovers and builds this file automatically
// using the @vercel/go builder.
//
// The Handler function is invoked for every HTTP request matched by the
// "backend" service in vercel.json (routePrefix "/_/backend"). Vercel strips
// the prefix before calling Handler, so Gin sees paths like /api/v1/warga.
//
// A sync.Once gate ensures the database pool and router are initialised only
// once per warm function instance.
package handler

import (
	"context"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"github.com/wahyutricahya/SIPBANSOS/backend/internal/auth"
	apphandler "github.com/wahyutricahya/SIPBANSOS/backend/internal/handler"
	"github.com/wahyutricahya/SIPBANSOS/backend/internal/server"
	"github.com/wahyutricahya/SIPBANSOS/backend/pkg/middleware"
)

var (
	once   sync.Once
	router *gin.Engine
)

func init() {
	gin.SetMode(gin.ReleaseMode)
}

func setup() {
	// Load .env when running locally; on Vercel env vars are injected directly.
	_ = godotenv.Load()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("[sipbansos] DATABASE_URL environment variable is required")
	}

	// Force IPv4 resolution — Supabase direct-connection hostnames only have
	// AAAA records on newer projects, which can fail on IPv6-less networks.
	dsn = resolveIPv4DSN(dsn)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	dbpool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatalf("[sipbansos] failed to connect to database: %v", err)
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dev-secret-change-me"
	}

	accessTTL := parseDuration("JWT_ACCESS_TTL", "8h")
	refreshTTL := parseDuration("JWT_REFRESH_TTL", "24h")
	jwtManager := auth.NewManager(jwtSecret, accessTTL, refreshTTL)

	h := apphandler.NewHandler(dbpool, jwtManager)
	authMiddleware := middleware.AuthMiddleware(jwtManager)

	r := gin.New()
	r.Use(gin.Recovery())

	// NOTE: Static file serving (r.Static "/api/v1/uploads") is intentionally
	// omitted here because Vercel's serverless filesystem is read-only.
	// File uploads are saved to /tmp/uploads inside UploadFile handler when
	// running on Vercel (VERCEL=1). For production, migrate to Supabase Storage.

	server.RegisterRoutes(r, h, authMiddleware)
	router = r
}

// Handler is the Vercel serverless entry point.
func Handler(w http.ResponseWriter, r *http.Request) {
	once.Do(setup)
	router.ServeHTTP(w, r)
}

// parseDuration reads a duration from an env var with a fallback default.
func parseDuration(key, fallback string) time.Duration {
	v := os.Getenv(key)
	if v == "" {
		v = fallback
	}
	d, err := time.ParseDuration(v)
	if err != nil {
		d, _ = time.ParseDuration(fallback)
	}
	return d
}

// resolveIPv4DSN resolves the hostname in the DSN to an IPv4 address and
// returns a rewritten DSN. Falls back to the original DSN on failure.
func resolveIPv4DSN(dsn string) string {
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return dsn
	}
	host := config.ConnConfig.Host
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	addrs, err := net.DefaultResolver.LookupIP(ctx, "ip4", host)
	if err != nil || len(addrs) == 0 {
		return dsn
	}
	ipv4 := addrs[0].String()
	log.Printf("[sipbansos] resolved %s → %s (IPv4)", host, ipv4)
	return strings.Replace(dsn, host, ipv4, 1)
}
