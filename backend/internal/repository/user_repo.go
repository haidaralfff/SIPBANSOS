package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/wahyutricahya/SIPBANSOS/backend/internal/model"
)

var ErrUserNotFound = errors.New("user not found")

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByIdentifier(ctx context.Context, identifier string) (*model.User, error) {
	const q = `
		SELECT id, username, email, full_name, role, password, is_active
		FROM users
		WHERE email = $1 OR username = $1
		LIMIT 1
	`
	var u model.User
	err := r.db.QueryRow(ctx, q, identifier).Scan(
		&u.ID,
		&u.Username,
		&u.Email,
		&u.FullName,
		&u.Role,
		&u.PasswordHash,
		&u.IsActive,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	const q = `
        SELECT id, username, email, full_name, role, password, is_active
        FROM users
        WHERE id = $1
        LIMIT 1
    `
	var u model.User
	err := r.db.QueryRow(ctx, q, id).Scan(
		&u.ID,
		&u.Username,
		&u.Email,
		&u.FullName,
		&u.Role,
		&u.PasswordHash,
		&u.IsActive,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) UpdateLastLogin(ctx context.Context, id string) error {
	const q = `UPDATE users SET last_login = NOW() WHERE id = $1`
	_, err := r.db.Exec(ctx, q, id)
	return err
}
