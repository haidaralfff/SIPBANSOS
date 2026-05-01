package server

import (
	"github.com/gin-gonic/gin"
	"github.com/wahyutricahya/SIPBANSOS/backend/internal/handler"
	"github.com/wahyutricahya/SIPBANSOS/backend/pkg/middleware"
)

func RegisterRoutes(r *gin.Engine, h *handler.Handler, authMiddleware gin.HandlerFunc) {
	api := r.Group("/api/v1")
	{
		api.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

		auth := api.Group("/auth")
		{
			auth.POST("/login", h.Login)
			auth.POST("/refresh", h.Refresh)
			auth.GET("/me", authMiddleware, h.Me)
		}

		protected := api.Group("")
		protected.Use(authMiddleware)
		{
			importGroup := protected.Group("/import", middleware.RequireRoles("admin", "petugas"))
			{
				importGroup.GET("/template", h.DownloadImportTemplate)
			}

			wargaRead := protected.Group("/warga")
			{
				wargaRead.GET("", h.ListWarga)
				wargaRead.GET("/:id", h.GetWarga)
			}

			wargaWrite := protected.Group("/warga", middleware.RequireRoles("admin", "petugas"))
			{
				wargaWrite.POST("", h.CreateWarga)
				wargaWrite.PUT("/:id", h.UpdateWarga)
				wargaWrite.DELETE("/:id", h.DeleteWarga)
			}

			protected.POST("/saw/run", middleware.RequireRoles("admin", "kepala_desa"), h.RunSAW)
		}
	}
}
