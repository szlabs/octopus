package api

import(
	"net/http"
	"log"
	"encoding/json"
	"io/ioutil"
)

func handleCreated(rw http.ResponseWriter){
	rw.WriteHeader(http.StatusCreated)
}

func handleNotFound(rw http.ResponseWriter){
	rw.WriteHeader(http.StatusNotFound)
}

func handleBadRequest(rw http.ResponseWriter){
	rw.WriteHeader(http.StatusBadRequest)
}

func handleConflict(rw http.ResponseWriter){
	rw.WriteHeader(http.StatusConflict)
}

func handleInternalServerError(rw http.ResponseWriter, err error){
	log.Printf("internal error: %v \n", err)
	rw.WriteHeader(http.StatusInternalServerError)
}

func writeJSON(rw http.ResponseWriter, v interface{}) error {
	b, err := json.Marshal(v)
	if err != nil {
		return err
	}

	_, err = rw.Write(b)
	return err
}

func readJSON(r *http.Request, v interface{}) error{
	data, err := ioutil.ReadAll(r.Body)
	if err != nil{
		return err
	}
	return json.Unmarshal(data, v)
}
