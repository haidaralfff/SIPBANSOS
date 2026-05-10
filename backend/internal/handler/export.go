package handler

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/wahyutricahya/SIPBANSOS/backend/internal/repository"
)

func (h *Handler) ExportData(c *gin.Context) {
	format := c.DefaultQuery("format", "csv")
	
	filter := repository.WargaFilter{
		Page:  1,
		Limit: 10000, // Export up to 10k rows
	}

	data, err := h.warga.List(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data warga"})
		return
	}

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
		}
		if err := writer.Write(headers); err != nil {
			return
		}

		for _, w := range data {
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
			}
			if err := writer.Write(row); err != nil {
				return
			}
		}
	} else {
		c.JSON(http.StatusNotImplemented, gin.H{"error": "Format not supported yet"})
	}
}
