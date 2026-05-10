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
		"c1_jumlah_keluarga",
		"c2_jumlah_tanggungan",
		"c3_pendidikan_kk",
		"c4_pekerjaan_kk",
		"c5_status_rumah",
		"c6_luas_rumah",
		"c7_daya_listrik",
		"c8_jumlah_kendaraan",
		"c9_tabungan",
		"c10_penghasilan",
		"c11_pengeluaran",
		"c12_kondisi_dinding",
		"c13_akses_air",
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
		"4",
		"3",
		"2",
		"3",
		"1",
		"45.5",
		"900",
		"1",
		"1500000",
		"3500000",
		"2000000",
		"1",
		"1",
	}
}
