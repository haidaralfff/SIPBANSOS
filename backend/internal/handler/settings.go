package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/wahyutricahya/SIPBANSOS/backend/internal/model"
)

// GetSettings loads all settings as key-value pairs
func (h *Handler) GetSettings(c *gin.Context) {
	ctx := c.Request.Context()
	rows, err := h.db.Query(ctx, "SELECT key, value FROM settings")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memuat pengaturan: " + err.Error()})
		return
	}
	defer rows.Close()

	settings := make(map[string]string)
	for rows.Next() {
		var key, val string
		if err := rows.Scan(&key, &val); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membaca pengaturan"})
			return
		}
		settings[key] = val
	}

	c.JSON(http.StatusOK, settings)
}

// UpdateSettings updates multiple setting values in a transaction
func (h *Handler) UpdateSettings(c *gin.Context) {
	var req map[string]string
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "input tidak valid: " + err.Error()})
		return
	}

	ctx := c.Request.Context()
	tx, err := h.db.Begin(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memulai transaksi"})
		return
	}
	defer tx.Rollback(ctx)

	for k, v := range req {
		_, err := tx.Exec(ctx, "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", k, v)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menyimpan setting '" + k + "': " + err.Error()})
			return
		}
	}

	if err := tx.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal meresmikan penyimpanan"})
		return
	}

	// Log audit trail
	if userID, ok := c.Get("user_id"); ok {
		_ = h.audit.Create(ctx, model.AuditLog{
			UserID:    userID.(string),
			Aksi:      "update",
			Tabel:     "settings",
			RecordID:  "settings",
			DataBaru:  mustJSON(req),
			IPAddress: c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
		})
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "pengaturan berhasil disimpan"})
}

type periodeRequest struct {
	NamaPeriode    string  `json:"nama_periode" binding:"required"`
	TanggalMulai   string  `json:"tanggal_mulai" binding:"required"`   // YYYY-MM-DD
	TanggalSelesai string  `json:"tanggal_selesai" binding:"required"` // YYYY-MM-DD
	Kuota          int     `json:"kuota" binding:"required,gt=0"`
	BobotID        *string `json:"bobot_id"`
	Status         string  `json:"status"` // draft, aktif, selesai
}

// CreatePeriode inserts a new period
func (h *Handler) CreatePeriode(c *gin.Context) {
	var req periodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "input tidak valid: " + err.Error()})
		return
	}

	start, err := time.Parse("2006-01-02", req.TanggalMulai)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tanggal_mulai harus berformat YYYY-MM-DD"})
		return
	}

	end, err := time.Parse("2006-01-02", req.TanggalSelesai)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tanggal_selesai harus berformat YYYY-MM-DD"})
		return
	}

	status := req.Status
	if status == "" {
		status = "draft"
	}

	ctx := c.Request.Context()
	tx, err := h.db.Begin(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memulai transaksi"})
		return
	}
	defer tx.Rollback(ctx)

	// If status is active, check and update other active periods to selesai
	if status == "aktif" {
		_, err = tx.Exec(ctx, "UPDATE periode_bansos SET status = 'selesai' WHERE status = 'aktif'")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengupdate status periode aktif lainnya"})
			return
		}
	}

	var newID string
	err = tx.QueryRow(ctx, `
		INSERT INTO periode_bansos (nama_periode, tanggal_mulai, tanggal_selesai, kuota, bobot_id, status)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`, req.NamaPeriode, start, end, req.Kuota, req.BobotID, status).Scan(&newID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuat periode: " + err.Error()})
		return
	}

	if err := tx.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menyimpan periode"})
		return
	}

	// Log audit trail
	if userID, ok := c.Get("user_id"); ok {
		_ = h.audit.Create(ctx, model.AuditLog{
			UserID:    userID.(string),
			Aksi:      "create",
			Tabel:     "periode_bansos",
			RecordID:  newID,
			DataBaru:  mustJSON(req),
			IPAddress: c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
		})
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "id": newID})
}

// UpdatePeriode updates an existing period by ID
func (h *Handler) UpdatePeriode(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id periode wajib diisi"})
		return
	}

	var req periodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "input tidak valid: " + err.Error()})
		return
	}

	start, err := time.Parse("2006-01-02", req.TanggalMulai)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tanggal_mulai harus berformat YYYY-MM-DD"})
		return
	}

	end, err := time.Parse("2006-01-02", req.TanggalSelesai)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tanggal_selesai harus berformat YYYY-MM-DD"})
		return
	}

	status := req.Status
	if status == "" {
		status = "draft"
	}

	ctx := c.Request.Context()

	// Load old value for audit trail
	var oldNama string
	var oldStart, oldEnd time.Time
	var oldKuota int
	var oldBobot *string
	var oldStatus string
	err = h.db.QueryRow(ctx, "SELECT nama_periode, tanggal_mulai, tanggal_selesai, kuota, bobot_id, status FROM periode_bansos WHERE id = $1", id).
		Scan(&oldNama, &oldStart, &oldEnd, &oldKuota, &oldBobot, &oldStatus)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "periode tidak ditemukan"})
		return
	}

	tx, err := h.db.Begin(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memulai transaksi"})
		return
	}
	defer tx.Rollback(ctx)

	// If status is active, check and update other active periods to selesai
	if status == "aktif" {
		_, err = tx.Exec(ctx, "UPDATE periode_bansos SET status = 'selesai' WHERE status = 'aktif' AND id <> $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengupdate status periode aktif lainnya"})
			return
		}
	}

	_, err = tx.Exec(ctx, `
		UPDATE periode_bansos
		SET nama_periode = $1, tanggal_mulai = $2, tanggal_selesai = $3, kuota = $4, bobot_id = $5, status = $6
		WHERE id = $7
	`, req.NamaPeriode, start, end, req.Kuota, req.BobotID, status, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengupdate periode: " + err.Error()})
		return
	}

	if err := tx.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menyimpan periode"})
		return
	}

	// Log audit trail
	if userID, ok := c.Get("user_id"); ok {
		_ = h.audit.Create(ctx, model.AuditLog{
			UserID:    userID.(string),
			Aksi:      "update",
			Tabel:     "periode_bansos",
			RecordID:  id,
			DataLama: mustJSON(gin.H{
				"nama_periode":    oldNama,
				"tanggal_mulai":   oldStart.Format("2006-01-02"),
				"tanggal_selesai": oldEnd.Format("2006-01-02"),
				"kuota":           oldKuota,
				"bobot_id":        oldBobot,
				"status":          oldStatus,
			}),
			DataBaru:  mustJSON(req),
			IPAddress: c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
		})
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// DeletePeriode deletes a period by ID
func (h *Handler) DeletePeriode(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id periode wajib diisi"})
		return
	}

	ctx := c.Request.Context()

	// Fetch old value for audit trail
	var oldNama string
	var oldStart, oldEnd time.Time
	var oldKuota int
	var oldBobot *string
	var oldStatus string
	err := h.db.QueryRow(ctx, "SELECT nama_periode, tanggal_mulai, tanggal_selesai, kuota, bobot_id, status FROM periode_bansos WHERE id = $1", id).
		Scan(&oldNama, &oldStart, &oldEnd, &oldKuota, &oldBobot, &oldStatus)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "periode tidak ditemukan"})
		return
	}

	tx, err := h.db.Begin(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memulai transaksi: " + err.Error()})
		return
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, "DELETE FROM hasil_saw WHERE periode_id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membersihkan hasil perhitungan terkait: " + err.Error()})
		return
	}

	_, err = tx.Exec(ctx, "DELETE FROM periode_bansos WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menghapus periode: " + err.Error()})
		return
	}

	if err := tx.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menyimpan transaksi penghapusan: " + err.Error()})
		return
	}

	// Log audit trail
	if userID, ok := c.Get("user_id"); ok {
		_ = h.audit.Create(ctx, model.AuditLog{
			UserID:    userID.(string),
			Aksi:      "delete",
			Tabel:     "periode_bansos",
			RecordID:  id,
			DataLama: mustJSON(gin.H{
				"nama_periode":    oldNama,
				"tanggal_mulai":   oldStart.Format("2006-01-02"),
				"tanggal_selesai": oldEnd.Format("2006-01-02"),
				"kuota":           oldKuota,
				"bobot_id":        oldBobot,
				"status":          oldStatus,
			}),
			IPAddress: c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
		})
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
