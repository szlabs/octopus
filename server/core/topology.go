package core

import(
	"github.com/steven-zou/topological-replication/server/model"
	"github.com/steven-zou/topological-replication/server/metadata"
)

var(
	DefaultTopologyMgr *TopologyManager
)

type TopologyManager struct{
	MetadataStore *metadata.Store
}

func (t *TopologyManager) Get() (*model.Topology ,error) {
	topology, err := t.MetadataStore.GetTopology()
	if err != nil{
		return nil, err
	}
	if topology != nil && len(topology.Nodes) > 0 {
		registies, err := DefaultRegMgr.List()
		if err != nil{
			return nil, err
		}
		nodeMap := map[string]*model.Registry{}
		for _, registry := range registies{
			nodeMap[registry.ID] = registry
		}
		nodes := []*model.Registry{}
		for _, node := range topology.Nodes{
			nodes = append(nodes, nodeMap[node.ID])
		}
		topology.Nodes = nodes
	}
	return topology, nil
}

func (t *TopologyManager) NodeExist(id string) (bool, error) {
	node, err := t.MetadataStore.GetTopologyNode(id)
	if err != nil{
		return false, err
	}
	return node != nil, nil
}

func (t *TopologyManager) CreateNode(id string) error {
	return t.MetadataStore.AddTopologyNode(id)
}

func (t *TopologyManager) DeleteNode(id string) error {
	return t.MetadataStore.DeleteTopologyNode(id)
}

func (t *TopologyManager) CreateEdge(edge *model.Edge) (string, error){
	return t.MetadataStore.CreateTopologyEdge(edge)
}

func (t *TopologyManager) DeleteEdge(id string) error {
	return t.MetadataStore.DeleteTopologyEdge(id)
}

func (t *TopologyManager) GetEdge(id string)(*model.Edge, error){
	return t.MetadataStore.GetTopologyEdge(id)
}

func (t *TopologyManager) EdgeExist(id string)(bool, error){
	edge, err := t.GetEdge(id)
	if err != nil{
		return false, err
	}
	return edge != nil, nil
}