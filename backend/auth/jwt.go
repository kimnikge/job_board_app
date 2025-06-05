package auth

import (
	"fmt"
	"os" // Для чтения переменных окружения
	"time"
	// "errors" // Раскомментировать, если будет использоваться

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecretKey []byte

func init() {
	// Загружаем секретный ключ из переменной окружения
	// В реальном приложении здесь должна быть более надежная обработка,
	// например, логирование и фатальная ошибка, если ключ не установлен.
	secret := os.Getenv("JWT_SECRET_KEY")
	if secret == "" {
		fmt.Println("Warning: JWT_SECRET_KEY not set, using default insecure key. SET THIS IN PRODUCTION!")
		secret = "your_very_secret_key_for_job_board_app_please_change_me"
	}
	jwtSecretKey = []byte(secret)
}

type Claims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken генерирует новый JWT токен
func GenerateToken(userID string, username string, role string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour) // Токен действителен 24 часа
	claims := &Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "job_board_app",
			Subject:   username, 
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecretKey)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

// ValidateToken проверяет JWT токен
func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("token is invalid")
	}

	return claims, nil
}

// AuthMiddleware создает middleware для проверки JWT
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Ожидаем формат "Bearer <token>"
		const bearerSchema = "Bearer "
		if len(authHeader) <= len(bearerSchema) || authHeader[:len(bearerSchema)] != bearerSchema {
			c.JSON(401, gin.H{"error": "Invalid token format, expected Bearer token"})
			c.Abort()
			return
		}
		tokenString := authHeader[len(bearerSchema):]

		claims, err := ValidateToken(tokenString)
		if err != nil {
			c.JSON(401, gin.H{"error": "Invalid token: " + err.Error()})
			c.Abort()
			return
		}

		// Сохраняем информацию о пользователе в контексте Gin
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("userRole", claims.Role)
		
		c.Next()
	}
}

// RoleAuthMiddleware проверяет, имеет ли пользователь одну из разрешенных ролей
func RoleAuthMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists {
			c.JSON(403, gin.H{"error": "User role not found in context"})
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			c.JSON(403, gin.H{"error": "User role in context is not a string"})
			c.Abort()
			return
		}

		isAllowed := false
		for _, allowedRole := range allowedRoles {
			if roleStr == allowedRole {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			c.JSON(403, gin.H{"error": "Forbidden: Insufficient permissions"})
			c.Abort()
			return
		}
		c.Next()
	}
}