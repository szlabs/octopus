package api

import (
	"log"
	"net/http"

	"github.com/harbor-incubator/octopus/server/model"
)

func Login(rw http.ResponseWriter, r *http.Request) {
	credential := &struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}{}
	if err := readJSON(r, credential); err != nil {
		log.Println(err)
		handleBadRequest(rw)
		return
	}

	if credential.Username != username || credential.Password != password {
		handleUnauthorized(rw)
		return
	}
	session, err := SessionStore.Get(r, sessionName)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}
	session.Values["key"] = &model.User{
		Name: credential.Username,
	}
	if err = SessionStore.Save(r, rw, session); err != nil {
		handleInternalServerError(rw, err)
		return
	}
}

func Logout(rw http.ResponseWriter, r *http.Request) {
	session, err := SessionStore.Get(r, sessionName)
	if err != nil {
		handleInternalServerError(rw, err)
		return
	}

	if session.IsNew {
		return
	}

	session.Options.MaxAge = -1
	if err = SessionStore.Save(r, rw, session); err != nil {
		handleInternalServerError(rw, err)
		return
	}
}
