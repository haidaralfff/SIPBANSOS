package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/wahyutricahya/SIPBANSOS/backend/internal/model"
)

var ErrWargaNotFound = errors.New("warga not found")

type WargaFilter struct {
	Page  int
	Limit int
	Query string
	RT    string
	RW    string
}

type WargaRepository struct {
	db *pgxpool.Pool
}

func NewWargaRepository(db *pgxpool.Pool) *WargaRepository {
	return &WargaRepository{db: db}
}

func (r *WargaRepository) List(ctx context.Context, filter WargaFilter) ([]model.Warga, error) {
	page := filter.Page
	if page < 1 {
		page = 1
	}
	limit := filter.Limit
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	base := `
		SELECT
			id, nik, no_kk, nama_lengkap, tanggal_lahir, jenis_kelamin, alamat,
			rt, rw, no_hp, foto_ktp_url, foto_kk_url,
			c1_value, c2_value, c3_value, c4_value, c5_value, c6_value, c7_value, c8_value, c9_value, c10_value, c11_value, c12_value, c13_value,
			is_active, created_by, created_at, updated_at
		FROM warga
		WHERE deleted_at IS NULL
	`

	clauses := []string{}
	args := []interface{}{}
	idx := 1

	if strings.TrimSpace(filter.Query) != "" {
		clauses = append(clauses, fmt.Sprintf("(nama_lengkap ILIKE $%d OR nik ILIKE $%d)", idx, idx))
		args = append(args, "%"+filter.Query+"%")
		idx++
	}
	if strings.TrimSpace(filter.RT) != "" {
		clauses = append(clauses, fmt.Sprintf("rt = $%d", idx))
		args = append(args, filter.RT)
		idx++
	}
	if strings.TrimSpace(filter.RW) != "" {
		clauses = append(clauses, fmt.Sprintf("rw = $%d", idx))
		args = append(args, filter.RW)
		idx++
	}

	if len(clauses) > 0 {
		base += " AND " + strings.Join(clauses, " AND ")
	}

	base += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", idx, idx+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, base, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := []model.Warga{}
	for rows.Next() {
		item, err := scanWarga(rows.Scan)
		if err != nil {
			return nil, err
		}
		result = append(result, item)
	}

	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return result, nil
}

func (r *WargaRepository) GetByID(ctx context.Context, id string) (*model.Warga, error) {
	const q = `
		SELECT
			id, nik, no_kk, nama_lengkap, tanggal_lahir, jenis_kelamin, alamat,
			rt, rw, no_hp, foto_ktp_url, foto_kk_url,
			c1_value, c2_value, c3_value, c4_value, c5_value, c6_value, c7_value, c8_value, c9_value, c10_value, c11_value, c12_value, c13_value,
			is_active, created_by, created_at, updated_at
		FROM warga
		WHERE id = $1 AND deleted_at IS NULL
		LIMIT 1
	`

	item, err := scanWarga(r.db.QueryRow(ctx, q, id).Scan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrWargaNotFound
		}
		return nil, err
	}
	return &item, nil
}

func (r *WargaRepository) Create(ctx context.Context, w model.Warga) (*model.Warga, error) {
	const q = `
		INSERT INTO warga (
			nik, no_kk, nama_lengkap, tanggal_lahir, jenis_kelamin, alamat,
			rt, rw, no_hp, foto_ktp_url, foto_kk_url,
			c1_value, c2_value, c3_value, c4_value, c5_value, c6_value, c7_value, c8_value, c9_value, c10_value, c11_value, c12_value, c13_value,
			is_active, created_by
		) VALUES (
			$1, $2, $3, $4, $5, $6,
			$7, $8, $9, $10, $11,
			$12, $13, $14, $15, $16,
			$17, $18, $19, $20, $21,
			$22, $23, $24,
			$25, $26
		)
		RETURNING
			id, nik, no_kk, nama_lengkap, tanggal_lahir, jenis_kelamin, alamat,
			rt, rw, no_hp, foto_ktp_url, foto_kk_url,
			c1_value, c2_value, c3_value, c4_value, c5_value, c6_value, c7_value, c8_value, c9_value, c10_value, c11_value, c12_value, c13_value,
			is_active, created_by, created_at, updated_at
	`

	item, err := scanWarga(r.db.QueryRow(ctx, q,
		w.NIK,
		w.NoKK,
		w.NamaLengkap,
		w.TanggalLahir,
		w.JenisKelamin,
		w.Alamat,
		w.RT,
		w.RW,
		w.NoHP,
		w.FotoKtpURL,
		w.FotoKKURL,
		w.C1Value,
		w.C2Value,
		w.C3Value,
		w.C4Value,
		w.C5Value,
		w.C6Value,
		w.C7Value,
		w.C8Value,
		w.C9Value,
		w.C10Value,
		w.C11Value,
		w.C12Value,
		w.C13Value,
		w.IsActive,
		w.CreatedBy,
	).Scan)
	if err != nil {
		return nil, err
	}

	return &item, nil
}

func (r *WargaRepository) Update(ctx context.Context, id string, w model.Warga) (*model.Warga, error) {
	const q = `
		UPDATE warga SET
			nik = $1,
			no_kk = $2,
			nama_lengkap = $3,
			tanggal_lahir = $4,
			jenis_kelamin = $5,
			alamat = $6,
			rt = $7,
			rw = $8,
			no_hp = $9,
			foto_ktp_url = $10,
			foto_kk_url = $11,
			c1_value = $12,
			c2_value = $13,
			c3_value = $14,
			c4_value = $15,
			c5_value = $16,
			c6_value = $17,
			c7_value = $18,
			c8_value = $19,
			c9_value = $20,
			c10_value = $21,
			c11_value = $22,
			c12_value = $23,
			c13_value = $24,
			updated_at = NOW()
		WHERE id = $25 AND deleted_at IS NULL
		RETURNING
			id, nik, no_kk, nama_lengkap, tanggal_lahir, jenis_kelamin, alamat,
			rt, rw, no_hp, foto_ktp_url, foto_kk_url,
			c1_value, c2_value, c3_value, c4_value, c5_value, c6_value, c7_value, c8_value, c9_value, c10_value, c11_value, c12_value, c13_value,
			is_active, created_by, created_at, updated_at
	`

	item, err := scanWarga(r.db.QueryRow(ctx, q,
		w.NIK,
		w.NoKK,
		w.NamaLengkap,
		w.TanggalLahir,
		w.JenisKelamin,
		w.Alamat,
		w.RT,
		w.RW,
		w.NoHP,
		w.FotoKtpURL,
		w.FotoKKURL,
		w.C1Value,
		w.C2Value,
		w.C3Value,
		w.C4Value,
		w.C5Value,
		w.C6Value,
		w.C7Value,
		w.C8Value,
		w.C9Value,
		w.C10Value,
		w.C11Value,
		w.C12Value,
		w.C13Value,
		id,
	).Scan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrWargaNotFound
		}
		return nil, err
	}

	return &item, nil
}

func (r *WargaRepository) SoftDelete(ctx context.Context, id string) error {
	const q = `UPDATE warga SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	result, err := r.db.Exec(ctx, q, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrWargaNotFound
	}
	return nil
}

func scanWarga(scan func(dest ...interface{}) error) (model.Warga, error) {
	var w model.Warga
	err := scan(
		&w.ID,
		&w.NIK,
		&w.NoKK,
		&w.NamaLengkap,
		&w.TanggalLahir,
		&w.JenisKelamin,
		&w.Alamat,
		&w.RT,
		&w.RW,
		&w.NoHP,
		&w.FotoKtpURL,
		&w.FotoKKURL,
		&w.C1Value,
		&w.C2Value,
		&w.C3Value,
		&w.C4Value,
		&w.C5Value,
		&w.C6Value,
		&w.C7Value,
		&w.C8Value,
		&w.C9Value,
		&w.C10Value,
		&w.C11Value,
		&w.C12Value,
		&w.C13Value,
		&w.IsActive,
		&w.CreatedBy,
		&w.CreatedAt,
		&w.UpdatedAt,
	)
	if err != nil {
		return model.Warga{}, err
	}

	return w, nil
}
