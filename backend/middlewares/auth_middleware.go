package middlewares

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"time"
	"web-scraper/config"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/gin-gonic/gin"
)

type CustomClaims struct {
	Scope string `json:"scope"`
	validator.RegisteredClaims
}

func (c CustomClaims) Validate(ctx context.Context) error {
	return nil
}

func EnsureAuthenitcation() gin.HandlerFunc {
	auth0Domain := config.GetAuth0Domain()
	auth0Audience := config.GetAuth0Audience()

	jwksProvider := jwks.NewCachingProvider(
		&url.URL{Scheme: "https", Host: auth0Domain, Path: ".well-known/jwks.json"},
		10*time.Minute,
	)

	jwtValidator, err := validator.New(
		jwksProvider.KeyFunc,
		validator.RS256,
		auth0Domain,
		[]string{auth0Audience},
		validator.WithCustomClaims(func() validator.CustomClaims { return &CustomClaims{} }),
		validator.WithAllowedClockSkew(time.Minute), // Allow 1 minute clock skew
	)

	if err != nil {
		log.Fatalf("Failed to set up JWT validator: %v", err)
	}

	return func(ctx *gin.Context) {
		token, err := jwtmiddleware.AuthHeaderTokenExtractor(ctx.Request)

		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing or invalid format"})
			return
		}

		validatedClaims, err := jwtValidator.ValidateToken(context.Background(), token)

		if err != nil {
			log.Printf("JWT Validation Error: %v", err)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Invalid token"})
			return
		}

		claims, ok := validatedClaims.(*validator.ValidatedClaims)

		if !ok {
			log.Println("WARNING: ValidatedClaims not found in context, but JWT check succeeded.")
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Authentication context error"})
			return
		}

		ctx.Set("UserID", claims.RegisteredClaims.Subject)
		ctx.Set("userClaims", claims)

		ctx.Next()

	}
}
