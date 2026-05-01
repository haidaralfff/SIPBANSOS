package main

import (
	"context"
	"flag"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	dir := flag.String("dir", "migrations", "directory with .sql files")
	dsn := flag.String("dsn", "", "database connection string")
	flag.Parse()

	if *dsn == "" {
		*dsn = os.Getenv("DATABASE_URL")
	}
	if *dsn == "" {
		log.Fatal("missing database connection string (use -dsn or DATABASE_URL)")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	config, err := pgxpool.ParseConfig(*dsn)
	if err != nil {
		log.Fatalf("failed to parse dsn: %v", err)
	}
	config.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		log.Fatalf("failed to connect db: %v", err)
	}
	defer pool.Close()

	files, err := migrationFiles(*dir)
	if err != nil {
		log.Fatalf("failed to list migrations: %v", err)
	}

	for _, file := range files {
		path := filepath.Join(*dir, file)
		content, err := os.ReadFile(path)
		if err != nil {
			log.Fatalf("failed to read %s: %v", file, err)
		}
		sql := strings.TrimSpace(string(content))
		if sql == "" {
			continue
		}

		if _, err := pool.Exec(ctx, sql); err != nil {
			log.Fatalf("migration %s failed: %v", file, err)
		}
		log.Printf("applied %s", file)
	}
}

func migrationFiles(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	files := []string{}
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		if strings.HasSuffix(name, ".sql") {
			files = append(files, name)
		}
	}

	sort.Strings(files)
	return files, nil
}
