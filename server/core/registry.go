package core

import(
	"errors"
	"github.com/steven-zou/topological-replication/server/model"
	"github.com/steven-zou/topological-replication/server/metadata"
)

var (
	ErrRegNotFound = errors.New("registry not found")

	DefaultRegMgr *RegistryManager
)

type RegistryManager struct{
	MetadataStore *metadata.Store 
}

func (r *RegistryManager) Get(id string) (*model.Registry, error){
	return r.MetadataStore.GetRegistry(id)
}

func (r *RegistryManager) Exist(id string) (bool, error){
	registry, err := r.Get(id)
	if err != nil{
		return false, err
	}
	return registry != nil, nil
}

func (r *RegistryManager) Create(registry *model.Registry) (string, error){
	return r.MetadataStore.AddRegistry(registry)
}

func (r *RegistryManager) Delete(id string) error{
	exist, err := r.Exist(id)
	if err != nil{
		return err
	}
	if !exist{
		return ErrRegNotFound
	}
	return r.MetadataStore.DeleteRegistry(id)
}

func (r *RegistryManager) List() ([]*model.Registry, error){
	return r.MetadataStore.ListRegistries()
}