package repository

import (
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/wahyutricahya/SIPBANSOS/backend/internal/model"
)

type AuditRepository struct {
	db *pgxpool.Pool
}

func NewAuditRepository(db *pgxpool.Pool) *AuditRepository {
	return &AuditRepository{db: db}
}

func (r *AuditRepository) Create(ctx context.Context, log model.AuditLog) error {
	const q = `
		INSERT INTO audit_log (
			user_id, aksi, tabel, record_id, data_lama, data_baru, ip_address, user_agent
		) VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, '')::inet, $8)
	`

	_, err := r.db.Exec(ctx, q,
		nullableString(log.UserID),
		log.Aksi,
		log.Tabel,
		nullableString(log.RecordID),
		nullableJSON(log.DataLama),
		nullableJSON(log.DataBaru),
		log.IPAddress,
		log.UserAgent,
	)
	return err
}

func (r *AuditRepository) ListByRecord(ctx context.Context, tableName string, recordID string, limit int) ([]model.AuditLog, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	const q = `
		SELECT
			a.id,
			COALESCE(a.user_id::text, ''),
			COALESCE(u.full_name, u.username, ''),
			a.aksi,
			a.tabel,
			COALESCE(a.record_id::text, ''),
			a.data_lama,
			a.data_baru,
			COALESCE(a.ip_address::text, ''),
			COALESCE(a.user_agent, ''),
			a.created_at
		FROM audit_log a
		LEFT JOIN users u ON u.id = a.user_id
		WHERE a.tabel = $1 AND a.record_id = $2
		ORDER BY a.created_at DESC
		LIMIT $3
	`

	rows, err := r.db.Query(ctx, q, tableName, recordID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]model.AuditLog, 0)
	for rows.Next() {
		var item model.AuditLog
		if err := rows.Scan(
			&item.ID,
			&item.UserID,
			&item.ActorName,
			&item.Aksi,
			&item.Tabel,
			&item.RecordID,
			&item.DataLama,
			&item.DataBaru,
			&item.IPAddress,
			&item.UserAgent,
			&item.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return items, nil
}

func nullableString(value string) any {
	if value == "" {
		return nil
	}
	return value
}

func nullableJSON(value json.RawMessage) any {
	if len(value) == 0 {
		return nil
	}
	return []byte(value)
}