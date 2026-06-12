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

func (h *Handler) ExportData(c *gin.Context) {
	format := c.DefaultQuery("format", "csv")
	periodeID := strings.TrimSpace(c.Query("periode_id"))
	ctx := c.Request.Context()

	filename := fmt.Sprintf("ekspor_data_warga_%s.%s", time.Now().Format("20060102"), format)

	if format == "csv" {
		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))

		writer := csv.NewWriter(c.Writer)
		defer writer.Flush()

		headers := []string{
			"NIK", "No KK", "Nama Lengkap", "Tanggal Lahir", "Jenis Kelamin",
			"Alamat", "RT", "RW", "No HP",
			"C1 (Jml Keluarga)", "C2 (Jml Tanggungan)", "C3 (Pendidikan)", "C4 (Pekerjaan)",
			"C5 (Status Rumah)", "C6 (Luas Rumah)", "C7 (Daya Listrik)", "C8 (Jml Kendaraan)",
			"C9 (Tabungan)", "C10 (Penghasilan)", "C11 (Pengeluaran)", "C12 (Kondisi Dinding)",
			"C13 (Akses Air)",
			"Nilai Vi", "Ranking", "Status Kelolosan",
		}
		if err := writer.Write(headers); err != nil {
			return
		}

		type rowItem struct {
			NIK          string
			NoKK         string
			NamaLengkap  string
			TanggalLahir time.Time
			JenisKelamin string
			Alamat       string
			RT           *string
			RW           *string
			NoHP         *string
			C1Value      float64
			C2Value      float64
			C3Value      float64
			C4Value      float64
			C5Value      float64
			C6Value      float64
			C7Value      float64
			C8Value      float64
			C9Value      float64
			C10Value     float64
			C11Value     float64
			C12Value     float64
			C13Value     float64
			NilaiVi      float64
			Ranking      int
			Status       string
		}

		var rows []rowItem
		var queryStr string
		var queryArgs []interface{}

		if periodeID != "" {
			queryStr = `
				SELECT 
					w.nik, w.no_kk, w.nama_lengkap, w.tanggal_lahir, w.jenis_kelamin,
					w.alamat, w.rt, w.rw, w.no_hp,
					w.c1_value, w.c2_value, w.c3_value, w.c4_value, w.c5_value,
					w.c6_value, w.c7_value, w.c8_value, w.c9_value, w.c10_value,
					w.c11_value, w.c12_value, w.c13_value,
					COALESCE(h.nilai_vi, 0.0) as nilai_vi, 
					COALESCE(h.ranking, 0) as ranking, 
					COALESCE(h.status, '-') as status
				FROM warga w
				LEFT JOIN hasil_saw h ON h.warga_id = w.id AND h.periode_id = $1
				WHERE w.deleted_at IS NULL
				ORDER BY h.ranking ASC NULLS LAST, w.nama_lengkap ASC
			`
			queryArgs = append(queryArgs, periodeID)
		} else {
			queryStr = `
				SELECT 
					w.nik, w.no_kk, w.nama_lengkap, w.tanggal_lahir, w.jenis_kelamin,
					w.alamat, w.rt, w.rw, w.no_hp,
					w.c1_value, w.c2_value, w.c3_value, w.c4_value, w.c5_value,
					w.c6_value, w.c7_value, w.c8_value, w.c9_value, w.c10_value,
					w.c11_value, w.c12_value, w.c13_value,
					0.0 as nilai_vi, 0 as ranking, '-' as status
				FROM warga w
				WHERE w.deleted_at IS NULL
				ORDER BY w.nama_lengkap ASC
			`
		}

		dbRows, err := h.db.Query(ctx, queryStr, queryArgs...)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal query data ekspor: " + err.Error()})
			return
		}
		defer dbRows.Close()

		for dbRows.Next() {
			var r rowItem
			err := dbRows.Scan(
				&r.NIK, &r.NoKK, &r.NamaLengkap, &r.TanggalLahir, &r.JenisKelamin,
				&r.Alamat, &r.RT, &r.RW, &r.NoHP,
				&r.C1Value, &r.C2Value, &r.C3Value, &r.C4Value, &r.C5Value,
				&r.C6Value, &r.C7Value, &r.C8Value, &r.C9Value, &r.C10Value,
				&r.C11Value, &r.C12Value, &r.C13Value,
				&r.NilaiVi, &r.Ranking, &r.Status,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membaca data ekspor: " + err.Error()})
				return
			}
			rows = append(rows, r)
		}

		for _, w := range rows {
			rt := ""
			if w.RT != nil {
				rt = *w.RT
			}
			rw := ""
			if w.RW != nil {
				rw = *w.RW
			}
			noHp := ""
			if w.NoHP != nil {
				noHp = *w.NoHP
			}

			nilaiViStr := "-"
			rankingStr := "-"
			statusStr := "-"

			if w.Ranking > 0 {
				nilaiViStr = fmt.Sprintf("%.4f", w.NilaiVi)
				rankingStr = strconv.Itoa(w.Ranking)
				statusStr = w.Status
			}

			row := []string{
				w.NIK,
				w.NoKK,
				w.NamaLengkap,
				w.TanggalLahir.Format("2006-01-02"),
				w.JenisKelamin,
				w.Alamat,
				rt,
				rw,
				noHp,
				fmt.Sprintf("%v", w.C1Value),
				fmt.Sprintf("%v", w.C2Value),
				fmt.Sprintf("%v", w.C3Value),
				fmt.Sprintf("%v", w.C4Value),
				fmt.Sprintf("%v", w.C5Value),
				fmt.Sprintf("%v", w.C6Value),
				fmt.Sprintf("%v", w.C7Value),
				fmt.Sprintf("%v", w.C8Value),
				fmt.Sprintf("%v", w.C9Value),
				fmt.Sprintf("%v", w.C10Value),
				fmt.Sprintf("%v", w.C11Value),
				fmt.Sprintf("%v", w.C12Value),
				fmt.Sprintf("%v", w.C13Value),
				nilaiViStr,
				rankingStr,
				statusStr,
			}
			if err := writer.Write(row); err != nil {
				return
			}
		}
	} else {
		c.JSON(http.StatusNotImplemented, gin.H{"error": "Format not supported yet"})
	}
}
