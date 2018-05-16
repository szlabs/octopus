package core

import (
	"crypto/tls"
	"errors"
	"log"
	"net/http"

	"github.com/steven-zou/topological-replication/server/metadata"
	"github.com/steven-zou/topological-replication/server/model"
	"github.com/steven-zou/topological-replication/server/util"
)

var (
	ErrRegNotFound = errors.New("registry not found")

	DefaultRegMgr *RegistryManager

	secureTransport   = &http.Transport{}
	insecureTransport = &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
		},
	}

	StatusHealthy   = "healthy"
	StatusUnhealthy = "unhealthy"
)

type RegistryManager struct {
	MetadataStore *metadata.Store
}

func (r *RegistryManager) Get(id string) (*model.Registry, error) {
	return r.MetadataStore.GetRegistry(id)
}

func (r *RegistryManager) Exist(id string) (bool, error) {
	registry, err := r.Get(id)
	if err != nil {
		return false, err
	}
	return registry != nil, nil
}

func (r *RegistryManager) Create(registry *model.Registry) (string, error) {
	registry.Status = registryHealthCheck(registry)
	return r.MetadataStore.AddRegistry(registry)
}

func (r *RegistryManager) Update(registry *model.Registry) error {
	registry.Status = registryHealthCheck(registry)
	return r.MetadataStore.UpdateRegistry(registry)
}

func (r *RegistryManager) Delete(id string) error {
	exist, err := r.Exist(id)
	if err != nil {
		return err
	}
	if !exist {
		return ErrRegNotFound
	}
	return r.MetadataStore.DeleteRegistry(id)
}

func (r *RegistryManager) Ping(id string) error {
	registry, err := r.Get(id)
	if err != nil {
		return err
	}
	if registry == nil {
		return ErrRegNotFound
	}

	client := util.New(registry.URL, registry.Username, registry.Password, registry.Insecure)
	return client.Ping(registry.URL, registry.Username, registry.Password, registry.Insecure)
}

func (r *RegistryManager) List() ([]*model.Registry, error) {
	return r.MetadataStore.ListRegistries()
}

func (r *RegistryManager) AutoHealthChecking() error {
	registries, err := r.List()
	if err != nil {
		return err
	}

	for _, registry := range registries {
		registry.Status = registryHealthCheck(registry)
		if err = r.MetadataStore.UpdateRegistry(registry); err != nil {
			log.Printf("failed to update registry %s: %v", registry.ID, err)
			continue
		}
	}
	return nil
}

func registryHealthCheck(registry *model.Registry) string {
	if registry == nil {
		return StatusUnhealthy
	}

	transport := secureTransport
	if registry.Insecure {
		transport = insecureTransport
	}
	client := util.NewWithCustomizedTransport(transport, registry.URL,
		registry.Username, registry.Password)
	if err := client.Ping(registry.URL, registry.Username,
		registry.Password, registry.Insecure); err != nil {
		log.Printf("health checking result: %v", err)
		return StatusUnhealthy
	}
	return StatusHealthy
}
