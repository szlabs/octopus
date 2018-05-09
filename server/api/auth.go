package api

import (
	"log"
	"net/http"

	"github.com/gorilla/sessions"
)

var (
	SessionStore sessions.Store
	sessionName  = "session_id"
	username     = "admin"
	password     = "vmware"
)

type AuthHandler struct {
	handler   http.Handler
	exception map[string]struct{}
}

func NewAuthHandler(handler http.Handler, exception ...string) *AuthHandler {
	m := map[string]struct{}{}
	for _, excep := range exception {
		m[excep] = struct{}{}
	}
	return &AuthHandler{
		handler:   handler,
		exception: m,
	}
}

func (a *AuthHandler) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	_, ignore := a.exception[r.URL.Path]
	if ignore || authenticate(r) {
		a.handler.ServeHTTP(rw, r)
		return
	}
	handleUnauthorized(rw)
	return
}

func authenticate(r *http.Request) bool {
	if r == nil {
		return false
	}
	// basic auth
	usr, pwd, ok := r.BasicAuth()
	if ok && usr == username && pwd == password {
		return true
	}
	// session
	session, err := SessionStore.Get(r, sessionName)
	if err != nil {
		log.Println(err)
		return false
	}
	_, exist := session.Values["key"]
	return exist
}
