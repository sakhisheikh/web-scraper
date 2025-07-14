package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

type BrokenLinks []BrokenLink

// Value implements the driver.Valuer interface for database saving
func (bl BrokenLinks) Value() (driver.Value, error) {
	if bl == nil {
		return nil, nil // Store as NULL in DB if the Go slice is nil
	}
	return json.Marshal(bl) // Marshal to JSON bytes
}

// Scan implements the sql.Scanner interface for database loading
func (bl *BrokenLinks) Scan(value interface{}) error {
	if value == nil {
		*bl = BrokenLinks{} // Ensure it's an empty slice, not nil, when DB value is NULL
		return nil
	}
	var byteSlice []byte
	switch v := value.(type) {
	case []byte:
		byteSlice = v
	case string:
		byteSlice = []byte(v)
	default:
		return errors.New("unsupported type for BrokenLinks scanning")
	}
	return json.Unmarshal(byteSlice, bl) // Unmarshal from JSON bytes
}

type URLAnalysis struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"` // For soft delete

	URL    string `gorm:"unique;not null;size:255" json:"url"`
	Status string `gorm:"default:'queued';size:20" json:"status"`

	// crawler data
	HTMLVersion           string      `gorm:"size:50" json:"htmlVersion"`
	PageTitle             string      `gorm:"type:varchar(512)" json:"pageTitle"`
	H1Count               int         `gorm:"default:0" json:"h1Count"`
	H2Count               int         `gorm:"default:0" json:"h2Count"`
	H3Count               int         `gorm:"default:0" json:"h3Count"`
	H4Count               int         `gorm:"default:0" json:"h4Count"`
	H5Count               int         `gorm:"default:0" json:"h5Count"`
	H6Count               int         `gorm:"default:0" json:"h6Count"`
	InternalLinkCount     int         `gorm:"default:0" json:"internalLinkCount"`
	ExternalLinkCount     int         `gorm:"default:0" json:"externalLinkCount"`
	InaccessibleLinkCount int         `gorm:"default:0" json:"inaccessibleLinkCount"`
	BrokenLinks           BrokenLinks `gorm:"type:json" json:"brokenLinks,omitempty"`
	HasLoginForm          bool        `gorm:"default:false" json:"hasLoginForm"`
}

type BrokenLink struct {
	URL          string `json:"url"`
	StatusCode   int    `json:"status"`
	ErrorMessage string `json:"err_message,omitempty"`
}
