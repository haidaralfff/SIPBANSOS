package handler

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"github.com/wahyutricahya/SIPBANSOS/backend/internal/auth"
	"github.com/wahyutricahya/SIPBANSOS/backend/internal/model"
	"github.com/wahyutricahya/SIPBANSOS/backend/internal/repository"
	"github.com/wahyutricahya/SIPBANSOS/backend/internal/saw"
)

type Handler struct {
	db       *pgxpool.Pool
	auth     *auth.Manager
	users    *repository.UserRepository
	warga    *repository.WargaRepository
	audit    *repository.AuditRepository
	kriteria *repository.KriteriaRepository
	reports  *repository.ReportRepository
}

func NewHandler(db *pgxpool.Pool, authManager *auth.Manager) *Handler {
	return &Handler{
		db:       db,
		auth:     authManager,
		users:    repository.NewUserRepository(db),
		warga:    repository.NewWargaRepository(db),
		audit:    repository.NewAuditRepository(db),
		kriteria: repository.NewKriteriaRepository(db),
		reports:  repository.NewReportRepository(db),
	}
}

type loginRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Password   string `json:"password" binding:"required"`
}

type refreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type wargaRequest struct {
	NIK                string `json:"nik" binding:"required"`
	NoKK               string `json:"no_kk" binding:"required"`
	NamaLengkap        string `json:"nama_lengkap" binding:"required"`
	TanggalLahir       string `json:"tanggal_lahir" binding:"required"`
	JenisKelamin       string `json:"jenis_kelamin" binding:"required"`
	Alamat             string `json:"alamat" binding:"required"`
	RT                 string `json:"rt"`
	RW                 string `json:"rw"`
	NoHP               string `json:"no_hp"`
	FotoKtpURL         string `json:"foto_ktp_url"`
	FotoKKURL          string `json:"foto_kk_url"`
	C1Value            float64 `json:"c1_value"`
	C2Value            float64 `json:"c2_value"`
	C3Value            float64 `json:"c3_value"`
	C4Value            float64 `json:"c4_value"`
	C5Value            float64 `json:"c5_value"`
	C6Value            float64 `json:"c6_value"`
	C7Value            float64 `json:"c7_value"`
	C8Value            float64 `json:"c8_value"`
	C9Value            float64 `json:"c9_value"`
	C10Value           float64 `json:"c10_value"`
	C11Value           float64 `json:"c11_value"`
	C12Value           float64 `json:"c12_value"`
	C13Value           float64 `json:"c13_value"`
}

type sawRunRequest struct {
	Kuota     int    `json:"kuota"`
	PeriodeID string `json:"periode_id"`
	BobotID   string `json:"bobot_id"`
}

// Auth handlers
func (h *Handler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.users.GetByIdentifier(c.Request.Context(), req.Identifier)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user"})
		return
	}

	if !user.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "account disabled"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	access, refresh, err := h.auth.GenerateTokens(*user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	_ = h.users.UpdateLastLogin(c.Request.Context(), user.ID)

	c.JSON(http.StatusOK, gin.H{
		"access_token":  access,
		"refresh_token": refresh,
		"expires_in":    int(h.auth.AccessTTL().Seconds()),
		"user":          user,
	})
}

func (h *Handler) Refresh(c *gin.Context) {
	var req refreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	claims, err := h.auth.ParseToken(req.RefreshToken, "refresh")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token"})
		return
	}

	user, err := h.users.GetByID(c.Request.Context(), claims.UserID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user"})
		return
	}
	if !user.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "account disabled"})
		return
	}

	access, refresh, err := h.auth.GenerateTokens(*user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  access,
		"refresh_token": refresh,
		"expires_in":    int(h.auth.AccessTTL().Seconds()),
	})
}

func (h *Handler) Me(c *gin.Context) {
	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing user context"})
		return
	}

	user, err := h.users.GetByID(c.Request.Context(), userID.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// Warga CRUD
func (h *Handler) ListWarga(c *gin.Context) {
	page := parseIntQuery(c, "page", 1)
	limit := parseIntQuery(c, "limit", 10)
	filter := repository.WargaFilter{
		Page:  page,
		Limit: limit,
		Query: c.Query("q"),
		RT:    c.Query("rt"),
		RW:    c.Query("rw"),
	}

	data, err := h.warga.List(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list warga"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  data,
		"page":  page,
		"limit": limit,
	})
}

func (h *Handler) CreateWarga(c *gin.Context) {
	var req wargaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dob, err := validateWargaRequest(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	createdBy := ""
	if rawUserID, ok := c.Get("user_id"); ok {
		createdBy, _ = rawUserID.(string)
	}

	item := wargaToModel(req, dob, createdBy)
	item.IsActive = true

	created, err := h.warga.Create(c.Request.Context(), item)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create warga"})
		return
	}

	if userID, ok := c.Get("user_id"); ok {
		_ = h.audit.Create(c.Request.Context(), model.AuditLog{
			UserID:    userID.(string),
			Aksi:      "create",
			Tabel:     "warga",
			RecordID:  created.ID,
			DataBaru:  mustJSON(created),
			IPAddress: c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
		})
	}

	go func() {
		if err := h.RecalculateSAWForActivePeriod(context.Background()); err != nil {
			log.Printf("[SAW] Error recalculating on warga create: %v", err)
		}
	}()

	c.JSON(http.StatusCreated, gin.H{"data": created})
}

func (h *Handler) GetWarga(c *gin.Context) {
	id := c.Param("id")
	item, err := h.warga.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrWargaNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "warga not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch warga"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": item})
}

func (h *Handler) UpdateWarga(c *gin.Context) {
	id := c.Param("id")
	previous, err := h.warga.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrWargaNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "warga not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch warga"})
		return
	}
	var req wargaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dob, err := validateWargaRequest(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item := wargaToModel(req, dob, "")
	updated, err := h.warga.Update(c.Request.Context(), id, item)
	if err != nil {
		if errors.Is(err, repository.ErrWargaNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "warga not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update warga"})
		return
	}

	if userID, ok := c.Get("user_id"); ok {
		_ = h.audit.Create(c.Request.Context(), model.AuditLog{
			UserID:    userID.(string),
			Aksi:      "update",
			Tabel:     "warga",
			RecordID:  updated.ID,
			DataLama:  mustJSON(previous),
			DataBaru:  mustJSON(updated),
			IPAddress: c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
		})
	}

	go func() {
		if err := h.RecalculateSAWForActivePeriod(context.Background()); err != nil {
			log.Printf("[SAW] Error recalculating on warga update: %v", err)
		}
	}()

	c.JSON(http.StatusOK, gin.H{"data": updated})
}

func (h *Handler) GetWargaHistory(c *gin.Context) {
	id := c.Param("id")
	items, err := h.audit.ListByRecord(c.Request.Context(), "warga", id, 50)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": items})
}

func (h *Handler) DeleteWarga(c *gin.Context) {
	id := c.Param("id")
	if err := h.warga.SoftDelete(c.Request.Context(), id); err != nil {
		if errors.Is(err, repository.ErrWargaNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "warga not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete warga"})
		return
	}

	go func() {
		if err := h.RecalculateSAWForActivePeriod(context.Background()); err != nil {
			log.Printf("[SAW] Error recalculating on warga delete: %v", err)
		}
	}()

	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// SAW execution endpoint
func (h *Handler) RunSAW(c *gin.Context) {
	var req sawRunRequest
	if err := c.ShouldBindJSON(&req); err != nil && !errors.Is(err, io.EOF) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	if req.PeriodeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "periode_id wajib diisi"})
		return
	}

	ctx := c.Request.Context()

	var periodName string
	var periodKuota int
	var bobotID string
	err := h.db.QueryRow(ctx, "SELECT nama_periode, kuota, bobot_id FROM periode_bansos WHERE id = $1", req.PeriodeID).Scan(&periodName, &periodKuota, &bobotID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Periode bansos tidak ditemukan"})
		return
	}

	resolvedKuota := req.Kuota
	if resolvedKuota <= 0 {
		resolvedKuota = periodKuota
	}
	if resolvedKuota <= 0 {
		resolvedKuota = 1
	}

	resolvedBobotID := req.BobotID
	if resolvedBobotID == "" {
		resolvedBobotID = bobotID
	}
	if resolvedBobotID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "versi bobot wajib diisi atau ditentukan di periode"})
		return
	}

	var b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13 float64
	err = h.db.QueryRow(ctx, `
		SELECT bobot_c1, bobot_c2, bobot_c3, bobot_c4, bobot_c5, bobot_c6, bobot_c7, bobot_c8, bobot_c9, bobot_c10, bobot_c11, bobot_c12, bobot_c13
		FROM bobot_kriteria WHERE id = $1
	`, resolvedBobotID).Scan(&b1, &b2, &b3, &b4, &b5, &b6, &b7, &b8, &b9, &b10, &b11, &b12, &b13)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat bobot kriteria untuk periode ini"})
		return
	}
	bobot := [13]float64{b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13}

	rows, err := h.db.Query(ctx, `
		SELECT id, nama_lengkap, c1_value, c2_value, c3_value, c4_value, c5_value, c6_value, c7_value, c8_value, c9_value, c10_value, c11_value, c12_value, c13_value
		FROM warga
		WHERE deleted_at IS NULL AND is_active = true AND foto_ktp_url IS NOT NULL AND foto_ktp_url <> '' AND foto_kk_url IS NOT NULL AND foto_kk_url <> ''
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat data warga dari database: " + err.Error()})
		return
	}
	defer rows.Close()

	var alternatifs []saw.Alternatif
	for rows.Next() {
		var a saw.Alternatif
		var c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13 float64
		err := rows.Scan(&a.ID, &a.Nama, &c1, &c2, &c3, &c4, &c5, &c6, &c7, &c8, &c9, &c10, &c11, &c12, &c13)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membaca data warga"})
			return
		}
		a.Nilai = [13]float64{c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13}
		alternatifs = append(alternatifs, a)
	}

	if len(alternatifs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak ada data warga terverifikasi (dokumen KTP & KK lengkap) untuk dihitung"})
		return
	}

	hasil := saw.HitungSAW(alternatifs, bobot, resolvedKuota)

	tx, err := h.db.Begin(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memulai transaksi database"})
		return
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, "DELETE FROM hasil_saw WHERE periode_id = $1", req.PeriodeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membersihkan data perhitungan lama"})
		return
	}

	for _, res := range hasil {
		_, err = tx.Exec(ctx, `
			INSERT INTO hasil_saw (periode_id, warga_id, nilai_vi, ranking, status)
			VALUES ($1, $2, $3, $4, $5)
		`, req.PeriodeID, res.AlternatifID, res.Vi, res.Ranking, res.Status)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan hasil perhitungan warga " + res.Nama + ": " + err.Error()})
			return
		}
	}

	err = tx.Commit(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal meresmikan penyimpanan hasil transaksi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"hasil": hasil, "kuota": resolvedKuota})
}

func parseIntQuery(c *gin.Context, key string, fallback int) int {
	value := strings.TrimSpace(c.DefaultQuery(key, ""))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}

func validateWargaRequest(req wargaRequest) (time.Time, error) {
	if len(req.NIK) != 16 || !isDigits(req.NIK) {
		return time.Time{}, errors.New("nik harus 16 digit")
	}
	if len(req.NoKK) != 16 || !isDigits(req.NoKK) {
		return time.Time{}, errors.New("no_kk harus 16 digit")
	}
	if req.JenisKelamin != "L" && req.JenisKelamin != "P" {
		return time.Time{}, errors.New("jenis_kelamin harus L atau P")
	}
	if req.C1Value < 0 || req.C2Value < 0 {
		return time.Time{}, errors.New("c1 dan c2 harus >= 0")
	}
	if !betweenFloat(req.C3Value, 1, 5) || !betweenFloat(req.C4Value, 1, 5) || !betweenFloat(req.C5Value, 1, 3) || !betweenFloat(req.C12Value, 1, 4) || !betweenFloat(req.C13Value, 1, 3) {
		return time.Time{}, errors.New("nilai skala kategori tidak valid")
	}
	if req.C6Value < 0 || req.C7Value < 0 || req.C8Value < 0 || req.C9Value < 0 || req.C10Value < 0 || req.C11Value < 0 {
		return time.Time{}, errors.New("nilai riil harus >= 0")
	}

	dob, err := time.Parse("2006-01-02", req.TanggalLahir)
	if err != nil {
		return time.Time{}, errors.New("tanggal_lahir harus format YYYY-MM-DD")
	}

	return dob, nil
}

func between(value int, min int, max int) bool {
	return value >= min && value <= max
}

func betweenFloat(value float64, min float64, max float64) bool {
	return value >= min && value <= max
}

func isDigits(value string) bool {
	if value == "" {
		return false
	}
	for _, r := range value {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}

func wargaToModel(req wargaRequest, dob time.Time, createdBy string) model.Warga {
	return model.Warga{
		NIK:                req.NIK,
		NoKK:               req.NoKK,
		NamaLengkap:        req.NamaLengkap,
		TanggalLahir:       dob,
		JenisKelamin:       req.JenisKelamin,
		Alamat:             req.Alamat,
		RT:                 stringPointer(req.RT),
		RW:                 stringPointer(req.RW),
		NoHP:               stringPointer(req.NoHP),
		FotoKtpURL:         stringPointer(req.FotoKtpURL),
		FotoKKURL:          stringPointer(req.FotoKKURL),
		C1Value:            req.C1Value,
		C2Value:            req.C2Value,
		C3Value:            req.C3Value,
		C4Value:            req.C4Value,
		C5Value:            req.C5Value,
		C6Value:            req.C6Value,
		C7Value:            req.C7Value,
		C8Value:            req.C8Value,
		C9Value:            req.C9Value,
		C10Value:           req.C10Value,
		C11Value:           req.C11Value,
		C12Value:           req.C12Value,
		C13Value:           req.C13Value,
		CreatedBy:          stringPointer(createdBy),
	}
}

func stringPointer(value string) *string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func mustJSON(value any) json.RawMessage {
	data, err := json.Marshal(value)
	if err != nil {
		return nil
	}
	return data
}

func (h *Handler) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal menerima file: " + err.Error()})
		return
	}

	ext := strings.ToLower(file.Filename)
	if !strings.HasSuffix(ext, ".jpg") && !strings.HasSuffix(ext, ".jpeg") && !strings.HasSuffix(ext, ".png") && !strings.HasSuffix(ext, ".webp") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP."})
		return
	}

	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ukuran file maksimal 5MB."})
		return
	}

	filename := strconv.FormatInt(time.Now().UnixNano(), 10) + "_" + file.Filename
	dst := "./uploads/" + filename

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file: " + err.Error()})
		return
	}

	urlPath := "/api/v1/uploads/" + filename
	c.JSON(http.StatusOK, gin.H{
		"url": urlPath,
	})
}

// Background auto calculation helper
func (h *Handler) RecalculateSAWForActivePeriod(ctx context.Context) error {
	var periodID string
	var periodKuota int
	var bobotID string
	err := h.db.QueryRow(ctx, "SELECT id, kuota, bobot_id FROM periode_bansos WHERE status = 'aktif' LIMIT 1").Scan(&periodID, &periodKuota, &bobotID)
	if err != nil {
		// If no active period is set, bypass calculation
		return nil
	}

	if bobotID == "" {
		return errors.New("active period is missing bobot_id configuration")
	}

	var b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13 float64
	err = h.db.QueryRow(ctx, `
		SELECT bobot_c1, bobot_c2, bobot_c3, bobot_c4, bobot_c5, bobot_c6, bobot_c7, bobot_c8, bobot_c9, bobot_c10, bobot_c11, bobot_c12, bobot_c13
		FROM bobot_kriteria WHERE id = $1
	`, bobotID).Scan(&b1, &b2, &b3, &b4, &b5, &b6, &b7, &b8, &b9, &b10, &b11, &b12, &b13)
	if err != nil {
		return err
	}
	bobot := [13]float64{b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13}

	rows, err := h.db.Query(ctx, `
		SELECT id, nama_lengkap, c1_value, c2_value, c3_value, c4_value, c5_value, c6_value, c7_value, c8_value, c9_value, c10_value, c11_value, c12_value, c13_value
		FROM warga
		WHERE deleted_at IS NULL AND is_active = true AND foto_ktp_url IS NOT NULL AND foto_ktp_url <> '' AND foto_kk_url IS NOT NULL AND foto_kk_url <> ''
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	var alternatifs []saw.Alternatif
	for rows.Next() {
		var a saw.Alternatif
		var c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13 float64
		err := rows.Scan(&a.ID, &a.Nama, &c1, &c2, &c3, &c4, &c5, &c6, &c7, &c8, &c9, &c10, &c11, &c12, &c13)
		if err != nil {
			return err
		}
		a.Nilai = [13]float64{c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13}
		alternatifs = append(alternatifs, a)
	}

	if len(alternatifs) == 0 {
		// Clear old results if there are no citizens
		_, err = h.db.Exec(ctx, "DELETE FROM hasil_saw WHERE periode_id = $1", periodID)
		return err
	}

	hasil := saw.HitungSAW(alternatifs, bobot, periodKuota)

	tx, err := h.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, "DELETE FROM hasil_saw WHERE periode_id = $1", periodID)
	if err != nil {
		return err
	}

	for _, res := range hasil {
		_, err = tx.Exec(ctx, `
			INSERT INTO hasil_saw (periode_id, warga_id, nilai_vi, ranking, status)
			VALUES ($1, $2, $3, $4, $5)
		`, periodID, res.AlternatifID, res.Vi, res.Ranking, res.Status)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}
