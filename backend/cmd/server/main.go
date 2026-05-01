package main

import (
	"context"
	"log"
	"os"
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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	dbpool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatalf("failed to connect db: %v", err)
	}
	defer dbpool.Close()

	r := gin.Default()

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
