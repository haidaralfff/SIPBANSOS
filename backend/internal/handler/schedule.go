package handler

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/wahyutricahya/SIPBANSOS/backend/internal/model"
)

type scheduleRequest struct {
	Title     string `json:"title" binding:"required"`
	StartTime string `json:"start_time" binding:"required"` // format "HH:MM" or "HH:MM:SS"
	EndTime   string `json:"end_time" binding:"required"`   // format "HH:MM" or "HH:MM:SS"
	Date      string `json:"date" binding:"required"`       // format YYYY-MM-DD
}

// ListSchedules retrieves schedules for a given date (defaults to today)
func (h *Handler) ListSchedules(c *gin.Context) {
	ctx := c.Request.Context()
	dateParam := strings.TrimSpace(c.Query("date"))

	if dateParam == "" {
		dateParam = time.Now().Format("2006-01-02")
	} else {
		// Validate date format YYYY-MM-DD
		_, err := time.Parse("2006-01-02", dateParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "format tanggal harus YYYY-MM-DD"})
			return
		}
	}

	rows, err := h.db.Query(ctx, `
		SELECT id, title, start_time::TEXT, end_time::TEXT, date, created_at
		FROM schedules
		WHERE date = $1
		ORDER BY start_time ASC
	`, dateParam)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memuat jadwal: " + err.Error()})
		return
	}
	defer rows.Close()

	var list []model.Schedule
	for rows.Next() {
		var s model.Schedule
		var startTimeStr, endTimeStr string
		err := rows.Scan(&s.ID, &s.Title, &startTimeStr, &endTimeStr, &s.Date, &s.CreatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membaca data jadwal"})
			return
		}

		// Truncate seconds from "HH:MM:SS" to "HH:MM" if present
		if len(startTimeStr) >= 5 {
			s.StartTime = startTimeStr[:5]
		} else {
			s.StartTime = startTimeStr
		}
		if len(endTimeStr) >= 5 {
			s.EndTime = endTimeStr[:5]
		} else {
			s.EndTime = endTimeStr
		}

		list = append(list, s)
	}

	c.JSON(http.StatusOK, gin.H{"data": list})
}

// CreateSchedule adds a new schedule (Admin only)
func (h *Handler) CreateSchedule(c *gin.Context) {
	var req scheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "input tidak valid: " + err.Error()})
		return
	}

	// Validate date
	dateParsed, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "format tanggal harus YYYY-MM-DD"})
		return
	}

	// Simple check for time format (HH:MM or HH:MM:SS)
	startTimeStr := strings.TrimSpace(req.StartTime)
	endTimeStr := strings.TrimSpace(req.EndTime)
	if len(startTimeStr) < 5 || len(endTimeStr) < 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "format waktu mulai/selesai tidak valid"})
		return
	}

	ctx := c.Request.Context()
	var newID string
	var createdAt time.Time

	err = h.db.QueryRow(ctx, `
		INSERT INTO schedules (title, start_time, end_time, date)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`, req.Title, startTimeStr, endTimeStr, dateParsed).Scan(&newID, &createdAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menyimpan jadwal baru: " + err.Error()})
		return
	}

	// Log audit trail
	if userID, ok := c.Get("user_id"); ok {
		_ = h.audit.Create(ctx, model.AuditLog{
			UserID:    userID.(string),
			Aksi:      "create",
			Tabel:     "schedules",
			RecordID:  newID,
			DataBaru:  mustJSON(req),
			IPAddress: c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
		})
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"id":      newID,
		"message": "jadwal baru berhasil ditambahkan",
	})
}
