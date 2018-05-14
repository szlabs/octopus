package model

import "time"

type Registry struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	URL        string `json:"url"`
	Username   string `json:"username"`
	Password   string `json:"password"`
	Insecure   bool   `json:"insecure"`
	Status     string `json:"status"`
	Kind       string `json:"kind"`
	CreateTime int64  `json:"create_time"`
	UpdateTime int64  `json:"update_time"`
}

// TODO add validate impl
func (r *Registry) Validate() error {
	return nil
}

type Edge struct {
	ID        string `json:"id"`
	SRCNodeID string `json:"src_node_id"`
	DSTNodeID string `json:"dst_node_id"`
	PolicyID  int64  `json:"policy_id"`
}

type Topology struct {
	Nodes []*Registry `json:"nodes"`
	Edges []*Edge     `json:"edges"`
}

type Filter struct {
	Kind    string `json:"kind"`
	Pattern string `json:"pattern"`
}

type Trigger struct {
	Kind          string         `json:"kind"`
	ScheduleParam *ScheduleParam `json:"schedule_param"`
}

type ScheduleParam struct {
	Type    string `json:"type"`
	Weekday int8   `json:"weekday"`
	Offtime int64  `json:"offtime"`
}

type Job struct {
	ID           int64     `json:"id"`
	Status       string    `json:"status"`
	Repository   string    `json:"repository"`
	PolicyID     int64     `json:"policy_id"`
	Operation    string    `json:"operation"`
	Tags         []string  `json:"tags"`
	CreationTime time.Time `json:"creation_time"`
	UpdateTime   time.Time `json:"update_time"`
}

type User struct {
	Name string
}

type Project struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}
