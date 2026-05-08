package handler

import (
	"net/http"
	"strconv"
	"strings"

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
