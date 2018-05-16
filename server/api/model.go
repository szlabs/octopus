package api

import (
	"github.com/steven-zou/topological-replication/server/model"
)

type edgeReq struct {
	ID        string     `json:"id"`
	SRCNodeID string     `json:"src_node_id"`
	DSTNodeID string     `json:"dst_node_id"`
	Policy    *policyReq `json:"policy"`
}

type policyReq struct {
	Description       string          `json:"description"`
	ProjectID         int64           `json:"project_id"`
	Filters           []*model.Filter `json:"filters"`
	ReplicateDeletion bool            `json:"replicate_deletion"`
	Trigger           *model.Trigger  `json:"trigger"`
}
