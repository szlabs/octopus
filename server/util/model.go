package util

import (
	"time"

	"github.com/harbor-incubator/octopus/server/model"
)

type harborTarget struct {
	ID           int64     `json:"id"`
	URL          string    `json:"endpoint"`
	Name         string    `json:"name"`
	Username     string    `json:"username"`
	Password     string    `json:"password"`
	Type         int       `json:"type"`
	Insecure     bool      `json:"insecure"`
	CreationTime time.Time `json:"creation_time"`
	UpdateTime   time.Time `json:"update_time"`
}

type Policy struct {
	ID                        int64           `json:"id"`
	Name                      string          `json:"name"`
	Description               string          `json:"description"`
	Filters                   []*model.Filter `json:"filters"`
	ReplicateDeletion         bool            `json:"replicate_deletion"`
	Trigger                   *model.Trigger  `json:"trigger"`
	Projects                  []*Project      `json:"projects"`
	Targets                   []*Target       `json:"targets"`
	CreationTime              time.Time       `json:"creation_time"`
	UpdateTime                time.Time       `json:"update_time"`
	ReplicateExistingImageNow bool            `json:"replicate_existing_image_now"`
}

type Project struct {
	ID int64 `json:"project_id"`
}
type Target struct {
	ID int64 `json:"id"`
}
