package model

type Registry struct{
	ID string `json:"id"`
	Name string `json:"name"`
	URL string `json:"url"`
	Username string `json:"username"`
	Password string `json:"password"`
	Insecure bool `json:"insecure"`
}

// TODO add validate impl
func (r *Registry) Validate() error{
	return nil
}

type Edge struct{
	ID string `json:"id"`
	SRCNodeID string `json:"src_node_id"`
	DSTNodeID string `json:"dst_node_id"`
	PolicyID int64 `json:"policy_id"`
}

type Topology struct{
	Nodes []*Registry `json:"nodes"`
	Edges []*Edge `json:"edges"`
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