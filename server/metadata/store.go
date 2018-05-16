package metadata

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"sync"
	"time"

	uuid "github.com/satori/go.uuid"
	"github.com/steven-zou/topological-replication/server/model"
)

var (
	DefaultStore *Store
)

type metadata struct {
	Registries []*model.Registry `json:"registries"`
	Topology   *model.Topology   `json:"topology"`
}

type Store struct {
	File string
	sync.RWMutex
}

func (s *Store) ListRegistries() ([]*model.Registry, error) {
	s.RLock()
	defer s.RUnlock()

	metadata, err := s.read()
	if err != nil {
		return nil, err
	}
	if metadata == nil {
		return nil, nil
	}
	return metadata.Registries, nil
}

func (s *Store) GetRegistry(id string) (*model.Registry, error) {
	registries, err := s.ListRegistries()
	if err != nil {
		return nil, err
	}
	for _, registry := range registries {
		if registry.ID == id {
			return registry, nil
		}
	}
	return nil, nil
}

func (s *Store) AddRegistry(registry *model.Registry) (string, error) {
	s.Lock()
	defer s.Unlock()

	metadata, err := s.read()
	if err != nil {
		return "", err
	}

	registry.ID = uuid.NewV4().String()
	registry.CreateTime = time.Now().Unix()
	registry.UpdateTime = registry.CreateTime
	metadata.Registries = append(metadata.Registries, registry)
	if err = s.write(metadata); err != nil {
		return "", err
	}
	return registry.ID, nil
}

func (s *Store) DeleteRegistry(id string) error {
	s.Lock()
	defer s.Unlock()

	metadata, err := s.read()
	if err != nil {
		return err
	}
	var i int = -1
	var registry *model.Registry
	for i, registry = range metadata.Registries {
		if registry.ID == id {
			break
		}
	}
	if i == -1 {
		return nil
	}

	metadata.Registries = append(metadata.Registries[:i], metadata.Registries[i+1:]...)
	return s.write(metadata)
}

func (s *Store) UpdateRegistry(registry *model.Registry) error {
	s.Lock()
	defer s.Unlock()

	metadata, err := s.read()
	if err != nil {
		return err
	}

	for _, reg := range metadata.Registries {
		if reg.ID == registry.ID {
			reg.Name = registry.Name
			reg.URL = registry.URL
			reg.Username = registry.Username
			reg.Password = registry.Password
			reg.Insecure = registry.Insecure
			reg.Status = registry.Status
			reg.UpdateTime = time.Now().Unix()
			log.Printf("Metadata updates: %#+v\n", reg)
			break
		}
	}
	return s.write(metadata)
}

func (s *Store) GetTopology() (*model.Topology, error) {
	s.RLock()
	defer s.RUnlock()

	metadata, err := s.read()
	if err != nil {
		return nil, err
	}
	if metadata == nil {
		return nil, nil
	}
	return metadata.Topology, nil
}

func (s *Store) GetTopologyNode(id string) (*model.Registry, error) {
	topology, err := s.GetTopology()
	if err != nil {
		return nil, err
	}
	if topology == nil {
		return nil, err
	}
	for _, node := range topology.Nodes {
		if node.ID == id {
			return node, nil
		}
	}
	return nil, nil
}

func (s *Store) AddTopologyNode(id string) error {
	s.Lock()
	defer s.Unlock()

	meta, err := s.read()
	if err != nil {
		return err
	}

	if meta == nil {
		meta = &metadata{}
	}

	if meta.Topology == nil {
		meta.Topology = &model.Topology{}
	}

	meta.Topology.Nodes = append(meta.Topology.Nodes, &model.Registry{
		ID: id,
	})
	return s.write(meta)
}

func (s *Store) DeleteTopologyNode(id string) error {
	s.Lock()
	defer s.Unlock()

	meta, err := s.read()
	if err != nil {
		return err
	}

	if meta == nil || meta.Topology == nil {
		return nil
	}
	i := -1
	for j, node := range meta.Topology.Nodes {
		if node.ID == id {
			i = j
			break
		}
	}
	if i == -1 {
		return nil
	}
	meta.Topology.Nodes = append(meta.Topology.Nodes[:i], meta.Topology.Nodes[i+1:]...)
	return s.write(meta)
}

func (s *Store) GetTopologyEdge(id string) (*model.Edge, error) {
	s.RLock()
	defer s.RUnlock()

	topology, err := s.GetTopology()
	if err != nil {
		return nil, err
	}
	if topology == nil {
		return nil, nil
	}
	for _, edge := range topology.Edges {
		if edge.ID == id {
			return edge, nil
		}
	}
	return nil, nil
}

func (s *Store) CreateTopologyEdge(edge *model.Edge) (string, error) {
	s.Lock()
	defer s.Unlock()

	meta, err := s.read()
	if err != nil {
		return "", err
	}
	if meta == nil {
		meta = &metadata{}
	}
	if meta.Topology == nil {
		meta.Topology = &model.Topology{}
	}

	//edge.ID = uuid.NewV4().String()
	meta.Topology.Edges = append(meta.Topology.Edges, edge)
	if err = s.write(meta); err != nil {
		return "", err
	}
	return edge.ID, nil
}

func (s *Store) DeleteTopologyEdge(id string) error {
	s.Lock()
	defer s.Unlock()

	meta, err := s.read()
	if err != nil {
		return err
	}
	if meta == nil || meta.Topology == nil {
		return nil
	}
	i := -1
	for j, edge := range meta.Topology.Edges {
		if edge.ID == id {
			i = j
			break
		}
	}
	if i == -1 {
		return nil
	}
	meta.Topology.Edges = append(meta.Topology.Edges[:i], meta.Topology.Edges[i+1:]...)
	return s.write(meta)
}

func (s *Store) read() (*metadata, error) {
	data, err := ioutil.ReadFile(s.File)
	if err != nil {
		return nil, err
	}
	if len(data) == 0 {
		return &metadata{}, nil
	}
	meta := &metadata{}
	if err = json.Unmarshal(data, meta); err != nil {
		return nil, err
	}
	return meta, nil
}

func (s *Store) write(meta *metadata) error {
	data, err := json.Marshal(meta)
	if err != nil {
		return err
	}
	return ioutil.WriteFile(s.File, data, 777)
}
