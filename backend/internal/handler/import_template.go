package handler

import (
	"bytes"
	"encoding/csv"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

func (h *Handler) DownloadImportTemplate(c *gin.Context) {
	format := strings.ToLower(c.DefaultQuery("format", "xlsx"))
	headers := importTemplateHeaders()
	sample := importTemplateSample()

	switch format {
	case "csv":
		buffer := &bytes.Buffer{}
		writer := csv.NewWriter(buffer)
		_ = writer.Write(headers)
		_ = writer.Write(sample)
		writer.Flush()
		if err := writer.Error(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate csv"})
			return
		}

		c.Header("Content-Disposition", "attachment; filename=template_warga.csv")
		c.Data(http.StatusOK, "text/csv", buffer.Bytes())
		return
	case "xlsx":
		file := excelize.NewFile()
		sheet := "Template"
		file.SetSheetName("Sheet1", sheet)
		for i, header := range headers {
			cell, _ := excelize.CoordinatesToCellName(i+1, 1)
			_ = file.SetCellValue(sheet, cell, header)
		}
		for i, value := range sample {
			cell, _ := excelize.CoordinatesToCellName(i+1, 2)
			_ = file.SetCellValue(sheet, cell, value)
		}

		infoSheet := "Petunjuk"
		_, _ = file.NewSheet(infoSheet)
		_ = file.SetCellValue(infoSheet, "A1", "Format tanggal: YYYY-MM-DD")
		_ = file.SetCellValue(infoSheet, "A2", "Jenis_kelamin: L atau P")
		_ = file.SetCellValue(infoSheet, "A3", "Nilai skala: 1 sampai 5")
		_ = file.SetCellValue(infoSheet, "A4", "Kolom rupiah diisi angka tanpa titik/koma")

		if index, err := file.GetSheetIndex(sheet); err == nil {
			file.SetActiveSheet(index)
		}
		buffer, err := file.WriteToBuffer()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate xlsx"})
			return
		}

		c.Header("Content-Disposition", "attachment; filename=template_warga.xlsx")
		c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer.Bytes())
		return
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "format harus csv atau xlsx"})
		return
	}
}

func importTemplateHeaders() []string {
	return []string{
		"nik",
		"no_kk",
		"nama_lengkap",
		"tanggal_lahir",
		"jenis_kelamin",
		"alamat",
		"rt",
		"rw",
		"no_hp",
		"penghasilan",
		"jumlah_tanggungan",
		"kondisi_tempat",
		"status_kepemilikan",
		"akses_air",
		"pengeluaran_listrik",
		"pengeluaran_pangan",
		"biaya_pendidikan",
		"biaya_kesehatan",
		"cicilan_hutang",
		"tingkat_pendidikan",
		"status_pekerjaan",
		"kondisi_kesehatan",
	}
}

func importTemplateSample() []string {
	return []string{
		"3174xxxxxxxxxxxx",
		"3174xxxxxxxxxxxx",
		"Siti Aminah",
		"1990-01-01",
		"P",
		"Jl. Mawar No. 1",
		"01",
		"02",
		"081234567890",
		"500000",
		"5",
		"4",
		"5",
		"5",
		"150000",
		"30000",
		"200000",
		"50000",
		"300000",
		"4",
		"5",
		"5",
	}
}
