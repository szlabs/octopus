package api

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/steven-zou/topological-replication/server/core"
	"github.com/steven-zou/topological-replication/server/model"
	"github.com/steven-zou/topological-replication/server/util"
	common_http "github.com/vmware/harbor/src/common/http"
)

func GetTopology(rw http.ResponseWriter, r *http.Request) {
	topology, err := core.DefaultTopologyMgr.Get()
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	if err = writeJSON(rw, topology); err != nil {
		handleInternalServerError(rw, err)
		return
	}
}

func CreateNode(rw http.ResponseWriter, r *http.Request) {
	registry := &model.Registry{}
	if err := readJSON(r, registry); err != nil {
		log.Printf("%v \n", err)
		handleBadRequest(rw)
		return
	}
	exist, err := core.DefaultRegMgr.Exist(registry.ID)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	if !exist {
		handleNotFound(rw)
		return
	}

	exist, err = core.DefaultTopologyMgr.NodeExist(registry.ID)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	if exist {
		handleConflict(rw)
		return
	}
	if err := core.DefaultTopologyMgr.CreateNode(registry.ID); err != nil {
		handleInternalServerError(rw, err)
		return
	}
}

func DeleteNode(rw http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	exist, err := core.DefaultTopologyMgr.NodeExist(id)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	if !exist {
		handleNotFound(rw)
		return
	}
	if err = core.DefaultTopologyMgr.DeleteNode(id); err != nil {
		handleInternalServerError(rw, err)
		return
	}
}

func CreateEdge(rw http.ResponseWriter, r *http.Request) {
	edge := &edgeReq{}
	if err := readJSON(r, edge); err != nil {
		log.Printf("%v \n", err)
		handleBadRequest(rw)
		return
	}
	srcReg, err := core.DefaultRegMgr.Get(edge.SRCNodeID)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	if srcReg == nil {
		log.Printf("src node %s not found \n", edge.SRCNodeID)
		handleNotFound(rw)
		return
	}
	dstReg, err := core.DefaultRegMgr.Get(edge.DSTNodeID)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	if dstReg == nil {
		log.Printf("dst node %s not found \n", edge.DSTNodeID)
		handleNotFound(rw)
		return
	}
	client := util.New(srcReg.URL, srcReg.Username, srcReg.Password, srcReg.Insecure)
	exist, targetId, err := client.TargetExist(dstReg.URL, dstReg.Username, dstReg.Insecure)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	// if the endpoint doesn't exist on src registry, create it first
	if !exist {
		targetId, err = client.CreateTarget(dstReg)
		if err != nil {
			handleInternalServerError(rw, err)
			return
		}
	}

	policy := &util.Policy{
		Name:        fmt.Sprintf("policy-%d", time.Now().Unix()),
		Description: edge.Policy.Description,
		Projects: []*util.Project{
			&util.Project{
				ID: edge.Policy.ProjectID,
			},
		},
		Targets: []*util.Target{
			&util.Target{
				ID: targetId,
			},
		},
		Filters:           edge.Policy.Filters,
		Trigger:           edge.Policy.Trigger,
		ReplicateDeletion: edge.Policy.ReplicateDeletion,
	}
	policyID, err := client.CreatePolicy(policy)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	id, err := core.DefaultTopologyMgr.CreateEdge(
		&model.Edge{
			SRCNodeID: srcReg.ID,
			DSTNodeID: dstReg.ID,
			PolicyID:  policyID,
		})
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	if err = writeJSON(rw, map[string]string{"id": id}); err != nil {
		handleInternalServerError(rw, err)
		return
	}
}

func DeleteEdge(rw http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	edge, err := core.DefaultTopologyMgr.GetEdge(id)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	if edge == nil {
		log.Printf("edge %s not found \n", id)
		handleNotFound(rw)
		return
	}

	registry, err := core.DefaultRegMgr.Get(edge.SRCNodeID)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	if registry == nil {
		handleInternalServerError(rw, fmt.Errorf("registry %s not exist", edge.SRCNodeID))
		return
	}

	client := util.New(registry.URL, registry.Username, registry.Password, registry.Insecure)
	if err = client.DeletePolicy(edge.PolicyID); err != nil {
		if er, ok := err.(*common_http.Error); ok && er.Code != 404 {
			handleInternalServerError(rw, err)
			return
		}
	}

	if err = core.DefaultTopologyMgr.DeleteEdge(id); err != nil {
		handleInternalServerError(rw, err)
		return
	}
}

func GetEdgeStatus(rw http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	edge, err := core.DefaultTopologyMgr.GetEdge(id)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	if edge == nil {
		log.Printf("edge %s not found \n", id)
		handleNotFound(rw)
		return
	}

	registry, err := core.DefaultRegMgr.Get(edge.SRCNodeID)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	if registry == nil {
		handleInternalServerError(rw, fmt.Errorf("registry %s not exist", edge.SRCNodeID))
		return
	}
	client := util.New(registry.URL, registry.Username, registry.Password, registry.Insecure)
	jobs, err := client.GetJobs(edge.PolicyID)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	if err = writeJSON(rw, jobs); err != nil {
		handleInternalServerError(rw, err)
	}
}
