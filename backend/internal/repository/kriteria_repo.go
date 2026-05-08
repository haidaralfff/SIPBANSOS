package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/wahyutricahya/SIPBANSOS/backend/internal/model"
)

var ErrKriteriaNotFound = errors.New("kriteria not found")

type KriteriaRepository struct {
  db *pgxpool.Pool
}

func NewKriteriaRepository(db *pgxpool.Pool) *KriteriaRepository {
  return &KriteriaRepository{db: db}
}

func (r *KriteriaRepository) GetActiveOrLatest(ctx context.Context) (*model.KriteriaBobot, error) {
  const activeQuery = `
    SELECT
      id, versi, keterangan,
      bobot_c1, bobot_c2, bobot_c3, bobot_c4, bobot_c5,
      bobot_c6, bobot_c7, bobot_c8, bobot_c9, bobot_c10,
      bobot_c11, bobot_c12, bobot_c13,
      is_active, dibuat_oleh, created_at
    FROM bobot_kriteria
    WHERE is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1
  `

  item, err := scanKriteria(r.db.QueryRow(ctx, activeQuery).Scan)
  if err == nil {
    return &item, nil
  }

  if !errors.Is(err, pgx.ErrNoRows) {
    return nil, err
  }

  const latestQuery = `
    SELECT
      id, versi, keterangan,
      bobot_c1, bobot_c2, bobot_c3, bobot_c4, bobot_c5,
      bobot_c6, bobot_c7, bobot_c8, bobot_c9, bobot_c10,
      bobot_c11, bobot_c12, bobot_c13,
      is_active, dibuat_oleh, created_at
    FROM bobot_kriteria
    ORDER BY created_at DESC
    LIMIT 1
  `

  item, err = scanKriteria(r.db.QueryRow(ctx, latestQuery).Scan)
  if err != nil {
    if errors.Is(err, pgx.ErrNoRows) {
      return nil, ErrKriteriaNotFound
    }
    return nil, err
  }

  return &item, nil
}

func (r *KriteriaRepository) GetByID(ctx context.Context, id string) (*model.KriteriaBobot, error) {
  const q = `
    SELECT
      id, versi, keterangan,
      bobot_c1, bobot_c2, bobot_c3, bobot_c4, bobot_c5,
      bobot_c6, bobot_c7, bobot_c8, bobot_c9, bobot_c10,
      bobot_c11, bobot_c12, bobot_c13,
      is_active, dibuat_oleh, created_at
    FROM bobot_kriteria
    WHERE id = $1
    LIMIT 1
  `

  item, err := scanKriteria(r.db.QueryRow(ctx, q, id).Scan)
  if err != nil {
    if errors.Is(err, pgx.ErrNoRows) {
      return nil, ErrKriteriaNotFound
    }
    return nil, err
  }

  return &item, nil
}

func (r *KriteriaRepository) Update(ctx context.Context, id string, data model.KriteriaBobot, activate bool) (*model.KriteriaBobot, error) {
  tx, err := r.db.Begin(ctx)
  if err != nil {
    return nil, err
  }
  defer tx.Rollback(ctx)

  if activate {
    if _, err := tx.Exec(ctx, `UPDATE bobot_kriteria SET is_active = FALSE WHERE is_active = TRUE AND id <> $1`, id); err != nil {
      return nil, err
    }
  }

  const q = `
    UPDATE bobot_kriteria SET
      versi = $1,
      keterangan = $2,
      bobot_c1 = $3,
      bobot_c2 = $4,
      bobot_c3 = $5,
      bobot_c4 = $6,
      bobot_c5 = $7,
      bobot_c6 = $8,
      bobot_c7 = $9,
      bobot_c8 = $10,
      bobot_c9 = $11,
      bobot_c10 = $12,
      bobot_c11 = $13,
      bobot_c12 = $14,
      bobot_c13 = $15,
      is_active = $16
    WHERE id = $17
    RETURNING
      id, versi, keterangan,
      bobot_c1, bobot_c2, bobot_c3, bobot_c4, bobot_c5,
      bobot_c6, bobot_c7, bobot_c8, bobot_c9, bobot_c10,
      bobot_c11, bobot_c12, bobot_c13,
      is_active, dibuat_oleh, created_at
  `

  item, err := scanKriteria(tx.QueryRow(ctx, q,
    data.Versi,
    data.Keterangan,
    data.BobotC1,
    data.BobotC2,
    data.BobotC3,
    data.BobotC4,
    data.BobotC5,
    data.BobotC6,
    data.BobotC7,
    data.BobotC8,
    data.BobotC9,
    data.BobotC10,
    data.BobotC11,
    data.BobotC12,
    data.BobotC13,
    data.IsActive,
    id,
  ).Scan)
  if err != nil {
    if errors.Is(err, pgx.ErrNoRows) {
      return nil, ErrKriteriaNotFound
    }
    return nil, err
  }

  if err := tx.Commit(ctx); err != nil {
    return nil, err
  }

  return &item, nil
}

func scanKriteria(scan func(dest ...interface{}) error) (model.KriteriaBobot, error) {
  var item model.KriteriaBobot
  err := scan(
    &item.ID,
    &item.Versi,
    &item.Keterangan,
    &item.BobotC1,
    &item.BobotC2,
    &item.BobotC3,
    &item.BobotC4,
    &item.BobotC5,
    &item.BobotC6,
    &item.BobotC7,
    &item.BobotC8,
    &item.BobotC9,
    &item.BobotC10,
    &item.BobotC11,
    &item.BobotC12,
    &item.BobotC13,
    &item.IsActive,
    &item.DibuatOleh,
    &item.CreatedAt,
  )
  if err != nil {
    return model.KriteriaBobot{}, err
  }

  return item, nil
}
