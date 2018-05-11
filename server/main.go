package main

import (
	"encoding/gob"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/steven-zou/topological-replication/server/model"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/steven-zou/topological-replication/server/api"
	"github.com/steven-zou/topological-replication/server/core"
	"github.com/steven-zou/topological-replication/server/metadata"
)

var (
	port int
	path string
)

func main() {
	flag.StringVar(&path, "f", "", "The file path which is used to store metadata")
	flag.IntVar(&port, "p", 8080, "The port that the server listens on")
	flag.Parse()
	if len(path) == 0 {
		log.Printf("metadata file should be specified \n")
		flag.Usage()
		return
	}

	if err := initMetadataStore(path); err != nil {
		log.Fatal(err)
	}

	initSessionStore()
	initResourceManager()
	handler := initHandler()

	go startRegistryHealthyChecking()

	log.Printf("server started, listen on :%d ...\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), handler))
}

func initMetadataStore(path string) error {
	if _, err := os.Stat(path); err != nil {
		if !os.IsNotExist(err) {
			return err
		}
		file, err := os.Create(path)
		if err != nil {
			return err
		}
		file.Close()
	}

	metadata.DefaultStore = &metadata.Store{
		File: path,
	}
	return nil
}

func initSessionStore() {
	gob.Register(&model.User{})
	api.SessionStore = sessions.NewCookieStore([]byte("secret"))
}

func initResourceManager() {
	core.DefaultRegMgr = &core.RegistryManager{
		MetadataStore: metadata.DefaultStore,
	}
	core.DefaultTopologyMgr = &core.TopologyManager{
		MetadataStore: metadata.DefaultStore,
	}
}

func initHandler() http.Handler {
	router := mux.NewRouter().StrictSlash(true).PathPrefix("/api/v1").Subrouter()
	router.NewRoute().Path("/login").Methods(http.MethodPost).
		HandlerFunc(api.Login)
	router.NewRoute().Path("/logout").Methods(http.MethodPost).
		HandlerFunc(api.Logout)
	router.NewRoute().Path("/registries").Methods(http.MethodGet).
		HandlerFunc(api.ListRegistry)
	router.NewRoute().Path("/registries").Methods(http.MethodPost).
		HandlerFunc(api.CreateRegistry)
	router.NewRoute().Path("/registries/{id}").Methods(http.MethodDelete).
		HandlerFunc(api.DeleteRegistry)
	router.NewRoute().Path("/registries/{id}/projects").Methods(http.MethodGet).
		HandlerFunc(api.ListProjects)
	router.NewRoute().Path("/topology").Methods(http.MethodGet).
		HandlerFunc(api.GetTopology)
	router.NewRoute().Path("/topology/nodes").Methods(http.MethodPost).
		HandlerFunc(api.CreateNode)
	router.NewRoute().Path("/topology/nodes/{id}").Methods(http.MethodDelete).
		HandlerFunc(api.DeleteNode)
	router.NewRoute().Path("/topology/edges").Methods(http.MethodPost).
		HandlerFunc(api.CreateEdge)
	router.NewRoute().Path("/topology/edges/{id}").Methods(http.MethodDelete).
		HandlerFunc(api.DeleteEdge)
	router.NewRoute().Path("/topology/edges/{id}/status").Methods(http.MethodGet).
		HandlerFunc(api.GetEdgeStatus)

	authHandler := api.NewAuthHandler(router, "/api/v1/login", "/api/v1/logout")
	handler := handlers.LoggingHandler(os.Stdout, authHandler)
	return handler
}

func startRegistryHealthyChecking() {
	for {
		log.Println("registries health checking...")
		if err := core.DefaultRegMgr.AutoHealthChecking(); err != nil {
			log.Printf("failed to check health of registries: %v", err)
		}
		time.Sleep(5 * time.Second)
	}
}
