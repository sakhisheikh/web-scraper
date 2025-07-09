package models

import "gorm.io/gorm"

type URLAnalysis struct {
	gorm.Model
	URL    string `gorm:"unique;not null;size:255"`
	Status string `gorm:"default:'queued';size:20"`

	// crawler data
	HTMLVersion           string `gorm:"size:50"`
	PageTitle             string `gorm:"type:varchar(512)"`
	H1Count               int    `gorm:"default:0"`
	H2Count               int    `gorm:"default:0"`
	H3Count               int    `gorm:"default:0"`
	H4Count               int    `gorm:"default:0"`
	H5Count               int    `gorm:"default:0"`
	H6Count               int    `gorm:"default:0"`
	InternalLinkCount     int    `gorm:"default:0"`
	ExternalLinkCount     int    `gorm:"default:0"`
	InaccessibleLinkCount int    `gorm:"default:0"`
	BrokenLinks           string `gorm:"type:text"`
	HasLoginForm          bool   `gorm:"default:false"`
}
