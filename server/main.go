package main

import(
	"fmt"
	"flag"
	"log"
	"net/http"
	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
	"os"
	"github.com/steven-zou/topological-replication/server/api"
	"github.com/steven-zou/topological-replication/server/core"
	"github.com/steven-zou/topological-replication/server/metadata"
)

var (
	port int
	path string
)

func main(){
	flag.StringVar(&path, "f", "", "The file path which is used to store metadata")
	flag.IntVar(&port, "p", 8080, "The port that the server listens on")
	flag.Parse()
	if len(path) == 0{
		log.Printf("metadata file should be specified \n")
		flag.Usage()
		return
	}

	if _, err := os.Stat(path); err != nil{
		if !os.IsNotExist(err){
			log.Panic(err)
		}
		file, err := os.Create(path)
		if err != nil{
			log.Panic(err)
		}
		file.Close()
	}

	metadata.DefaultStore = &metadata.Store{
		File: path,
	}
	core.DefaultRegMgr = &core.RegistryManager{
		MetadataStore: metadata.DefaultStore,
	}
	core.DefaultTopologyMgr = &core.TopologyManager{
		MetadataStore: metadata.DefaultStore,
	}

	router := mux.NewRouter().PathPrefix("/api/v1").Subrouter()
	router.NewRoute().Path("/registries").Methods(http.MethodGet).
		HandlerFunc(api.ListRegistry)
	router.NewRoute().Path("/registries").Methods(http.MethodPost).
		HandlerFunc(api.CreateRegistry)
	router.NewRoute().Path("/registries/{id}").Methods(http.MethodDelete).
		HandlerFunc(api.DeleteRegistry)
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

	handler := handlers.LoggingHandler(os.Stdout, router)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), handler))
}