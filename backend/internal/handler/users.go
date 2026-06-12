package handler

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type userResponse struct {
	ID        string     `json:"id"`
	Username  string     `json:"username"`
	Email     string     `json:"email"`
	FullName  string     `json:"full_name"`
	Role      string     `json:"role"`
	IsActive  bool       `json:"is_active"`
	LastLogin *time.Time `json:"last_login"`
}

func (h *Handler) ListUsers(c *gin.Context) {
	ctx := c.Request.Context()
	rows, err := h.db.Query(ctx, `
		SELECT id, username, email, full_name, role, is_active, last_login
		FROM users
		ORDER BY created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memuat daftar pengguna: " + err.Error()})
		return
	}
	defer rows.Close()

	var list []userResponse
	for rows.Next() {
		var u userResponse
		err := rows.Scan(
			&u.ID,
			&u.Username,
			&u.Email,
			&u.FullName,
			&u.Role,
			&u.IsActive,
			&u.LastLogin,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membaca data pengguna: " + err.Error()})
			return
		}
		list = append(list, u)
	}

	if list == nil {
		list = []userResponse{}
	}

	c.JSON(http.StatusOK, gin.H{"data": list})
}

type createUserRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
	Role     string `json:"role" binding:"required"`
	IsActive bool   `json:"is_active"`
}

func (h *Handler) CreateUser(c *gin.Context) {
	var req createUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "input tidak valid: " + err.Error()})
		return
	}

	username := strings.ToLower(strings.TrimSpace(req.Username))
	email := strings.ToLower(strings.TrimSpace(req.Email))
	role := strings.TrimSpace(req.Role)

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memproses password"})
		return
	}

	ctx := c.Request.Context()
	var newID string
	err = h.db.QueryRow(ctx, `
		INSERT INTO users (username, email, password, full_name, role, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`, username, email, string(hashed), req.FullName, role, req.IsActive).Scan(&newID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuat pengguna: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "id": newID})
}

type updateUserRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password"`
	FullName string `json:"full_name" binding:"required"`
	Role     string `json:"role" binding:"required"`
	IsActive bool   `json:"is_active"`
}

func (h *Handler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id pengguna wajib diisi"})
		return
	}

	var req updateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "input tidak valid: " + err.Error()})
		return
	}

	username := strings.ToLower(strings.TrimSpace(req.Username))
	email := strings.ToLower(strings.TrimSpace(req.Email))
	role := strings.TrimSpace(req.Role)

	ctx := c.Request.Context()
	
	if req.Password != "" {
		if len(req.Password) < 6 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "password minimal 6 karakter"})
			return
		}
		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memproses password"})
			return
		}
		
		_, err = h.db.Exec(ctx, `
			UPDATE users
			SET username = $1, email = $2, password = $3, full_name = $4, role = $5, is_active = $6, updated_at = NOW()
			WHERE id = $7
		`, username, email, string(hashed), req.FullName, role, req.IsActive, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memperbarui pengguna: " + err.Error()})
			return
		}
	} else {
		_, err := h.db.Exec(ctx, `
			UPDATE users
			SET username = $1, email = $2, full_name = $3, role = $4, is_active = $5, updated_at = NOW()
			WHERE id = $6
		`, username, email, req.FullName, role, req.IsActive, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memperbarui pengguna: " + err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id pengguna wajib diisi"})
		return
	}

	ctx := c.Request.Context()
	
	// Prevent self deletion
	userIDVal, ok := c.Get("user_id")
	if ok && userIDVal.(string) == id {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tidak dapat menghapus akun Anda sendiri"})
		return
	}

	_, err := h.db.Exec(ctx, "DELETE FROM users WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Pengguna tidak dapat dihapus karena memiliki riwayat aktivitas di sistem. Silakan nonaktifkan akun ini sebagai gantinya.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
