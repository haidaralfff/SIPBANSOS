package main

import (
	"context"
	"flag"
	"log"
	"net"
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

	// Resolve hostname to IPv4 and rewrite DSN to force IPv4 connection.
	resolvedDSN := resolveToIPv4(*dsn)

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	config, err := pgxpool.ParseConfig(resolvedDSN)
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
		log.Printf("warning: could not resolve %s to IPv4, using original DSN: %v", host, err)
		return dsn
	}

	ipv4 := addrs[0].String()
	log.Printf("resolved %s → %s (IPv4)", host, ipv4)
	return strings.Replace(dsn, host, ipv4, 1)
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
