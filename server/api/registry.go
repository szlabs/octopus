package api

import(
	"log"
	"net/http"
	"github.com/steven-zou/topological-replication/server/core"
	"github.com/steven-zou/topological-replication/server/model"
	"github.com/gorilla/mux"
)

func ListRegistry(rw http.ResponseWriter, r *http.Request){
	registries, err := core.DefaultRegMgr.List()
	if err != nil{
		handleInternalServerError(rw, err)
		return
	}
	if err = writeJSON(rw, registries); err != nil{
		handleInternalServerError(rw, err)
		return
	}
}

func CreateRegistry(rw http.ResponseWriter, r *http.Request){
	registry := &model.Registry{}
	if err := readJSON(r, registry); err != nil{
		log.Printf("%v \n", err)
		handleBadRequest(rw)
		return
	}
	id, err := core.DefaultRegMgr.Create(registry)
	if err != nil{
		handleInternalServerError(rw, err)
		return
	}
	if err = writeJSON(rw, map[string]string{"id":id}); err != nil{
		handleInternalServerError(rw, err)
		return
	}
}

func DeleteRegistry(rw http.ResponseWriter, r *http.Request){
	id := mux.Vars(r)["id"]
	// TODO: check if the registry is referenced by topylogy graph
	if err := core.DefaultRegMgr.Delete(id); err != nil{
		if err == core.ErrRegNotFound {
			handleNotFound(rw)
			return
		}
		handleInternalServerError(rw, err)
		return
	}
}