// Package dbutil provides a helper to create a pgx connection pool
// that resolves hostnames to IPv4 only. This is needed when connecting
// to Supabase from networks that do not support IPv6 routing.
package dbutil

import (
	"context"
	"net"

	"github.com/jackc/pgx/v5/pgxpool"
)

// NewPool creates a pgxpool.Pool from the given DSN, forcing IPv4-only
// DNS resolution to avoid "no route to host" errors on IPv6-only DNS responses.
func NewPool(ctx context.Context, dsn string) (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}

	// Force IPv4 by overriding the dialer's resolver.
	config.ConnConfig.DialFunc = func(ctx context.Context, network, addr string) (net.Conn, error) {
		host, port, err := net.SplitHostPort(addr)
		if err != nil {
			return nil, err
		}

		// Resolve to IPv4 only.
		addrs, err := net.DefaultResolver.LookupIP(ctx, "ip4", host)
		if err != nil || len(addrs) == 0 {
			// Fallback: try default resolution if IPv4 lookup fails.
			return (&net.Dialer{}).DialContext(ctx, network, addr)
		}

		ipv4Addr := net.JoinHostPort(addrs[0].String(), port)
		return (&net.Dialer{}).DialContext(ctx, "tcp4", ipv4Addr)
	}

	return pgxpool.NewWithConfig(ctx, config)
}
