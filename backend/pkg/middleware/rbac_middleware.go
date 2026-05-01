package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func RequireRoles(roles ...string) gin.HandlerFunc {
	allowed := make(map[string]struct{}, len(roles))
	for _, role := range roles {
		allowed[strings.ToLower(role)] = struct{}{}
	}

	return func(c *gin.Context) {
		rawRole, ok := c.Get("user_role")
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing role"})
			c.Abort()
			return
		}

		role, ok := rawRole.(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid role"})
			c.Abort()
			return
		}

		if _, exists := allowed[strings.ToLower(role)]; !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			c.Abort()
			return
		}

		c.Next()
	}
}
