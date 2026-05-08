package handler

import (
  "errors"
  "math"
  "net/http"
  "strings"

  "github.com/gin-gonic/gin"

  "github.com/wahyutricahya/SIPBANSOS/backend/internal/model"
  "github.com/wahyutricahya/SIPBANSOS/backend/internal/repository"
)

type kriteriaDefinition struct {
  Code string
  Name string
  Type string
}

type kriteriaItem struct {
  Code   string  `json:"code"`
  Name   string  `json:"name"`
  Type   string  `json:"type"`
  Weight float64 `json:"weight"`
}

type kriteriaVersion struct {
  ID         string  `json:"id"`
  Versi      string  `json:"versi"`
  Keterangan *string `json:"keterangan,omitempty"`
  IsActive   bool    `json:"is_active"`
}

type kriteriaResponse struct {
  Version     *kriteriaVersion `json:"version,omitempty"`
  Criteria    []kriteriaItem   `json:"criteria"`
  TotalWeight float64          `json:"total_weight"`
}

type kriteriaUpdateRequest struct {
  Versi       string  `json:"versi"`
  Keterangan  *string `json:"keterangan"`
  IsActive    *bool   `json:"is_active"`
  BobotC1     float64 `json:"bobot_c1" binding:"required"`
  BobotC2     float64 `json:"bobot_c2" binding:"required"`
  BobotC3     float64 `json:"bobot_c3" binding:"required"`
  BobotC4     float64 `json:"bobot_c4" binding:"required"`
  BobotC5     float64 `json:"bobot_c5" binding:"required"`
  BobotC6     float64 `json:"bobot_c6" binding:"required"`
  BobotC7     float64 `json:"bobot_c7" binding:"required"`
  BobotC8     float64 `json:"bobot_c8" binding:"required"`
  BobotC9     float64 `json:"bobot_c9" binding:"required"`
  BobotC10    float64 `json:"bobot_c10" binding:"required"`
  BobotC11    float64 `json:"bobot_c11" binding:"required"`
  BobotC12    float64 `json:"bobot_c12" binding:"required"`
  BobotC13    float64 `json:"bobot_c13" binding:"required"`
}

var kriteriaDefinitions = []kriteriaDefinition{
  {Code: "C1", Name: "Penghasilan per Bulan", Type: "Benefit"},
  {Code: "C2", Name: "Jumlah Tanggungan", Type: "Benefit"},
  {Code: "C3", Name: "Kondisi Tempat Tinggal", Type: "Benefit"},
  {Code: "C4", Name: "Status Kepemilikan Rumah", Type: "Benefit"},
  {Code: "C5", Name: "Akses Air Bersih", Type: "Benefit"},
  {Code: "C6", Name: "Pengeluaran Listrik/Bulan", Type: "Cost"},
  {Code: "C7", Name: "Pengeluaran Pangan/Hari", Type: "Cost"},
  {Code: "C8", Name: "Biaya Pendidikan Anak/Bulan", Type: "Cost"},
  {Code: "C9", Name: "Biaya Kesehatan/Bulan", Type: "Cost"},
  {Code: "C10", Name: "Cicilan/Hutang per Bulan", Type: "Cost"},
  {Code: "C11", Name: "Tingkat Pendidikan KK", Type: "Benefit"},
  {Code: "C12", Name: "Status Pekerjaan KK", Type: "Benefit"},
  {Code: "C13", Name: "Kondisi Kesehatan Keluarga", Type: "Benefit"}
}

func (h *Handler) ListKriteria(c *gin.Context) {
  data, err := h.kriteria.GetActiveOrLatest(c.Request.Context())
  if err != nil {
    if errors.Is(err, repository.ErrKriteriaNotFound) {
      response := buildKriteriaResponse(nil)
      c.JSON(http.StatusOK, response)
      return
    }
    c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load kriteria"})
    return
  }

  response := buildKriteriaResponse(data)
  c.JSON(http.StatusOK, response)
}

func (h *Handler) UpdateKriteria(c *gin.Context) {
  id := strings.TrimSpace(c.Param("id"))
  if id == "" {
    c.JSON(http.StatusBadRequest, gin.H{"error": "missing kriteria id"})
    return
  }

  var req kriteriaUpdateRequest
  if err := c.ShouldBindJSON(&req); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
  }

  existing, err := h.kriteria.GetByID(c.Request.Context(), id)
  if err != nil {
    if errors.Is(err, repository.ErrKriteriaNotFound) {
      c.JSON(http.StatusNotFound, gin.H{"error": "kriteria not found"})
      return
    }
    c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load kriteria"})
    return
  }

  total := req.BobotC1 + req.BobotC2 + req.BobotC3 + req.BobotC4 + req.BobotC5 +
    req.BobotC6 + req.BobotC7 + req.BobotC8 + req.BobotC9 + req.BobotC10 +
    req.BobotC11 + req.BobotC12 + req.BobotC13
  if math.Abs(total-100) > 0.01 {
    c.JSON(http.StatusBadRequest, gin.H{"error": "total bobot harus 100"})
    return
  }

  updated := *existing
  if strings.TrimSpace(req.Versi) != "" {
    updated.Versi = req.Versi
  }
  if req.Keterangan != nil {
    updated.Keterangan = req.Keterangan
  }
  if req.IsActive != nil {
    updated.IsActive = *req.IsActive
  }

  updated.BobotC1 = req.BobotC1
  updated.BobotC2 = req.BobotC2
  updated.BobotC3 = req.BobotC3
  updated.BobotC4 = req.BobotC4
  updated.BobotC5 = req.BobotC5
  updated.BobotC6 = req.BobotC6
  updated.BobotC7 = req.BobotC7
  updated.BobotC8 = req.BobotC8
  updated.BobotC9 = req.BobotC9
  updated.BobotC10 = req.BobotC10
  updated.BobotC11 = req.BobotC11
  updated.BobotC12 = req.BobotC12
  updated.BobotC13 = req.BobotC13

  saved, err := h.kriteria.Update(c.Request.Context(), id, updated, updated.IsActive)
  if err != nil {
    if errors.Is(err, repository.ErrKriteriaNotFound) {
      c.JSON(http.StatusNotFound, gin.H{"error": "kriteria not found"})
      return
    }
    c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update kriteria"})
    return
  }

  response := buildKriteriaResponse(saved)
  c.JSON(http.StatusOK, response)
}

func buildKriteriaResponse(bobot *model.KriteriaBobot) kriteriaResponse {
  weights := make([]float64, 13)
  var version *kriteriaVersion

  if bobot != nil {
    weights = []float64{
      bobot.BobotC1,
      bobot.BobotC2,
      bobot.BobotC3,
      bobot.BobotC4,
      bobot.BobotC5,
      bobot.BobotC6,
      bobot.BobotC7,
      bobot.BobotC8,
      bobot.BobotC9,
      bobot.BobotC10,
      bobot.BobotC11,
      bobot.BobotC12,
      bobot.BobotC13,
    }
    version = &kriteriaVersion{
      ID:         bobot.ID,
      Versi:      bobot.Versi,
      Keterangan: bobot.Keterangan,
      IsActive:   bobot.IsActive,
    }
  }

  total := 0.0
  items := make([]kriteriaItem, 0, len(kriteriaDefinitions))
  for index, def := range kriteriaDefinitions {
    weight := 0.0
    if index < len(weights) {
      weight = weights[index]
    }
    total += weight
    items = append(items, kriteriaItem{
      Code:   def.Code,
      Name:   def.Name,
      Type:   def.Type,
      Weight: weight,
    })
  }

  return kriteriaResponse{
    Version:     version,
    Criteria:    items,
    TotalWeight: total,
  }
}
