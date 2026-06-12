package handler

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func (h *Handler) ListPeriode(c *gin.Context) {
  data, err := h.reports.ListPeriods(c.Request.Context())
  if err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load periode"})
    return
  }

  c.JSON(http.StatusOK, gin.H{"data": data})
}

func (h *Handler) ReportRanking(c *gin.Context) {
  periodeID := strings.TrimSpace(c.Query("periode_id"))
  if periodeID == "" {
    c.JSON(http.StatusBadRequest, gin.H{"error": "periode_id is required"})
    return
  }

  status := strings.TrimSpace(c.Query("status"))
  limit := parseOptionalLimit(c.Query("limit"))

  data, err := h.reports.GetRanking(c.Request.Context(), periodeID, status, limit)
  if err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load ranking"})
    return
  }

  summary, err := h.reports.GetSummary(c.Request.Context(), periodeID)
  if err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load summary"})
    return
  }

  c.JSON(http.StatusOK, gin.H{
    "data":    data,
    "summary": summary,
  })
}

func (h *Handler) ReportSummary(c *gin.Context) {
  periodeID := strings.TrimSpace(c.Query("periode_id"))
  if periodeID == "" {
    c.JSON(http.StatusBadRequest, gin.H{"error": "periode_id is required"})
    return
  }

  summary, err := h.reports.GetSummary(c.Request.Context(), periodeID)
  if err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load summary"})
    return
  }

  c.JSON(http.StatusOK, gin.H{"summary": summary})
}

func (h *Handler) ReportRekap(c *gin.Context) {
	periodeID := strings.TrimSpace(c.Query("periode_id"))
	if periodeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "periode_id is required"})
		return
	}

	rows, err := h.db.Query(c.Request.Context(), `
		SELECT 
			COALESCE(w.rt, '-'), COALESCE(w.rw, '-'),
			COUNT(CASE WHEN h.status = 'Penerima' THEN 1 END) as penerima,
			COUNT(CASE WHEN h.status = 'Cadangan' THEN 1 END) as cadangan,
			COUNT(CASE WHEN h.status = 'Tidak Lolos' THEN 1 END) as tidak_lolos,
			COUNT(*) as total
		FROM hasil_saw h
		JOIN warga w ON w.id = h.warga_id
		WHERE h.periode_id = $1
		GROUP BY w.rt, w.rw
		ORDER BY w.rt ASC, w.rw ASC
	`, periodeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load rekap: " + err.Error()})
		return
	}
	defer rows.Close()

	type rekapItem struct {
		RT         string `json:"rt"`
		RW         string `json:"rw"`
		Penerima   int    `json:"penerima"`
		Cadangan   int    `json:"cadangan"`
		TidakLolos int    `json:"tidak_lolos"`
		Total      int    `json:"total"`
	}

	var list []rekapItem
	for rows.Next() {
		var item rekapItem
		err := rows.Scan(&item.RT, &item.RW, &item.Penerima, &item.Cadangan, &item.TidakLolos, &item.Total)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to scan rekap"})
			return
		}
		list = append(list, item)
	}

	c.JSON(http.StatusOK, gin.H{"data": list})
}

func (h *Handler) ListAuditLogs(c *gin.Context) {
	ctx := c.Request.Context()
	rows, err := h.db.Query(ctx, `
		SELECT a.created_at, COALESCE(u.username, 'system'), a.aksi, a.tabel, a.record_id, a.ip_address
		FROM audit_log a
		LEFT JOIN users u ON u.id = a.user_id
		ORDER BY a.created_at DESC
		LIMIT 1000
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load audit logs: " + err.Error()})
		return
	}
	defer rows.Close()

	type auditItem struct {
		CreatedAt time.Time `json:"created_at"`
		Username  string    `json:"username"`
		Aksi      string    `json:"aksi"`
		Tabel     string    `json:"tabel"`
		RecordID  string    `json:"record_id"`
		IPAddress string    `json:"ip_address"`
	}

	var logs []auditItem
	for rows.Next() {
		var item auditItem
		err := rows.Scan(&item.CreatedAt, &item.Username, &item.Aksi, &item.Tabel, &item.RecordID, &item.IPAddress)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to scan audit log"})
			return
		}
		logs = append(logs, item)
	}

	c.JSON(http.StatusOK, gin.H{"data": logs})
}

func (h *Handler) ExportReport(c *gin.Context) {
	ctx := c.Request.Context()
	periodeID := strings.TrimSpace(c.Query("periode_id"))
	reportType := strings.ToLower(strings.TrimSpace(c.Query("type")))

	if reportType != "audit" && periodeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "periode_id is required"})
		return
	}

	filename := fmt.Sprintf("laporan_%s_%s.csv", reportType, time.Now().Format("20060102"))
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))

	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	switch reportType {
	case "sk":
		headers := []string{"Ranking", "NIK", "Nama Lengkap", "RT", "RW", "Skor Vi", "Status"}
		if err := writer.Write(headers); err != nil {
			return
		}

		rows, err := h.db.Query(ctx, `
			SELECT h.ranking, w.nik, w.nama_lengkap, COALESCE(w.rt, '-'), COALESCE(w.rw, '-'), h.nilai_vi, h.status
			FROM hasil_saw h
			JOIN warga w ON w.id = h.warga_id
			WHERE h.periode_id = $1 AND h.status = 'Penerima'
			ORDER BY h.ranking ASC
		`, periodeID)
		if err != nil {
			return
		}
		defer rows.Close()

		for rows.Next() {
			var rank int
			var nik, nama, rt, rw, status string
			var vi float64
			if err := rows.Scan(&rank, &nik, &nama, &rt, &rw, &vi, &status); err != nil {
				return
			}
			row := []string{
				strconv.Itoa(rank),
				nik,
				nama,
				rt,
				rw,
				fmt.Sprintf("%.4f", vi),
				status,
			}
			_ = writer.Write(row)
		}

	case "ranking":
		headers := []string{"Ranking", "NIK", "Nama Lengkap", "RT", "RW", "Skor Vi", "Status"}
		if err := writer.Write(headers); err != nil {
			return
		}

		rows, err := h.db.Query(ctx, `
			SELECT h.ranking, w.nik, w.nama_lengkap, COALESCE(w.rt, '-'), COALESCE(w.rw, '-'), h.nilai_vi, h.status
			FROM hasil_saw h
			JOIN warga w ON w.id = h.warga_id
			WHERE h.periode_id = $1
			ORDER BY h.ranking ASC
		`, periodeID)
		if err != nil {
			return
		}
		defer rows.Close()

		for rows.Next() {
			var rank int
			var nik, nama, rt, rw, status string
			var vi float64
			if err := rows.Scan(&rank, &nik, &nama, &rt, &rw, &vi, &status); err != nil {
				return
			}
			row := []string{
				strconv.Itoa(rank),
				nik,
				nama,
				rt,
				rw,
				fmt.Sprintf("%.4f", vi),
				status,
			}
			_ = writer.Write(row)
		}

	case "rekap":
		headers := []string{"RT", "RW", "Jumlah Penerima", "Jumlah Cadangan", "Jumlah Tidak Lolos", "Total Alternatif"}
		if err := writer.Write(headers); err != nil {
			return
		}

		rows, err := h.db.Query(ctx, `
			SELECT 
				COALESCE(w.rt, '-'), COALESCE(w.rw, '-'),
				COUNT(CASE WHEN h.status = 'Penerima' THEN 1 END) as penerima,
				COUNT(CASE WHEN h.status = 'Cadangan' THEN 1 END) as cadangan,
				COUNT(CASE WHEN h.status = 'Tidak Lolos' THEN 1 END) as tidak_lolos,
				COUNT(*) as total
			FROM hasil_saw h
			JOIN warga w ON w.id = h.warga_id
			WHERE h.periode_id = $1
			GROUP BY w.rt, w.rw
			ORDER BY w.rt ASC, w.rw ASC
		`, periodeID)
		if err != nil {
			return
		}
		defer rows.Close()

		for rows.Next() {
			var rt, rw string
			var pen, cad, tlos, tot int
			if err := rows.Scan(&rt, &rw, &pen, &cad, &tlos, &tot); err != nil {
				return
			}
			row := []string{
				rt, rw,
				strconv.Itoa(pen),
				strconv.Itoa(cad),
				strconv.Itoa(tlos),
				strconv.Itoa(tot),
			}
			_ = writer.Write(row)
		}

	case "audit":
		headers := []string{"Timestamp", "Username", "Aksi", "Tabel", "Record ID", "IP Address"}
		if err := writer.Write(headers); err != nil {
			return
		}

		rows, err := h.db.Query(ctx, `
			SELECT a.created_at, COALESCE(u.username, 'system'), a.aksi, a.tabel, a.record_id, a.ip_address
			FROM audit_log a
			LEFT JOIN users u ON u.id = a.user_id
			ORDER BY a.created_at DESC
			LIMIT 1000
		`)
		if err != nil {
			return
		}
		defer rows.Close()

		for rows.Next() {
			var createdAt time.Time
			var user, aksi, tabel, record, ip string
			if err := rows.Scan(&createdAt, &user, &aksi, &tabel, &record, &ip); err != nil {
				return
			}
			row := []string{
				createdAt.Format("2006-01-02 15:04:05"),
				user,
				aksi,
				tabel,
				record,
				ip,
			}
			_ = writer.Write(row)
		}
	}
}

func parseOptionalLimit(value string) int {
  value = strings.TrimSpace(value)
  if value == "" {
    return 0
  }
  parsed, err := strconv.Atoi(value)
  if err != nil || parsed <= 0 {
    return 0
  }
  return parsed
}
