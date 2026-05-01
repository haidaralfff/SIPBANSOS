package handler

import (
	"errors"
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
	db    *pgxpool.Pool
	auth  *auth.Manager
	users *repository.UserRepository
	warga *repository.WargaRepository
}

func NewHandler(db *pgxpool.Pool, authManager *auth.Manager) *Handler {
	return &Handler{
		db:    db,
		auth:  authManager,
		users: repository.NewUserRepository(db),
		warga: repository.NewWargaRepository(db),
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
	Penghasilan        int64  `json:"penghasilan" binding:"required"`
	JumlahTanggungan   int    `json:"jumlah_tanggungan" binding:"required"`
	KondisiTempat      int    `json:"kondisi_tempat" binding:"required"`
	StatusKepemilikan  int    `json:"status_kepemilikan" binding:"required"`
	AksesAir           int    `json:"akses_air" binding:"required"`
	PengeluaranListrik int64  `json:"pengeluaran_listrik" binding:"required"`
	PengeluaranPangan  int64  `json:"pengeluaran_pangan" binding:"required"`
	BiayaPendidikan    int64  `json:"biaya_pendidikan" binding:"required"`
	BiayaKesehatan     int64  `json:"biaya_kesehatan" binding:"required"`
	CicilanHutang      int64  `json:"cicilan_hutang" binding:"required"`
	TingkatPendidikan  int    `json:"tingkat_pendidikan" binding:"required"`
	StatusPekerjaan    int    `json:"status_pekerjaan" binding:"required"`
	KondisiKesehatan   int    `json:"kondisi_kesehatan" binding:"required"`
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

	c.JSON(http.StatusOK, gin.H{"data": updated})
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

	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// SAW execution endpoint
func (h *Handler) RunSAW(c *gin.Context) {
	// For demo, create dummy alternatif and run SAW
	alternatif := []saw.Alternatif{
		{ID: 1, Nama: "Ali", Nilai: [13]float64{5, 4, 3, 3, 4, 2, 2, 3, 3, 1, 4, 5, 2}},
		{ID: 2, Nama: "Budi", Nilai: [13]float64{3, 3, 4, 4, 3, 3, 3, 2, 2, 2, 3, 3, 3}},
	}
	bobot := [13]float64{0.15, 0.10, 0.08, 0.08, 0.05, 0.07, 0.08, 0.08, 0.07, 0.07, 0.07, 0.08, 0.02}
	hasil := saw.HitungSAW(alternatif, bobot, 1)
	c.JSON(http.StatusOK, gin.H{"hasil": hasil})
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
	if req.Penghasilan <= 0 {
		return time.Time{}, errors.New("penghasilan harus lebih dari 0")
	}
	if req.JumlahTanggungan <= 0 {
		return time.Time{}, errors.New("jumlah_tanggungan harus lebih dari 0")
	}
	if !between(req.KondisiTempat, 1, 5) ||
		!between(req.StatusKepemilikan, 1, 5) ||
		!between(req.AksesAir, 1, 5) ||
		!between(req.TingkatPendidikan, 1, 5) ||
		!between(req.StatusPekerjaan, 1, 5) ||
		!between(req.KondisiKesehatan, 1, 5) {
		return time.Time{}, errors.New("nilai skala harus 1 sampai 5")
	}
	if req.PengeluaranListrik < 0 || req.PengeluaranPangan < 0 || req.BiayaPendidikan < 0 || req.BiayaKesehatan < 0 || req.CicilanHutang < 0 {
		return time.Time{}, errors.New("nilai rupiah harus >= 0")
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
		Penghasilan:        req.Penghasilan,
		JumlahTanggungan:   req.JumlahTanggungan,
		KondisiTempat:      req.KondisiTempat,
		StatusKepemilikan:  req.StatusKepemilikan,
		AksesAir:           req.AksesAir,
		PengeluaranListrik: req.PengeluaranListrik,
		PengeluaranPangan:  req.PengeluaranPangan,
		BiayaPendidikan:    req.BiayaPendidikan,
		BiayaKesehatan:     req.BiayaKesehatan,
		CicilanHutang:      req.CicilanHutang,
		TingkatPendidikan:  req.TingkatPendidikan,
		StatusPekerjaan:    req.StatusPekerjaan,
		KondisiKesehatan:   req.KondisiKesehatan,
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
