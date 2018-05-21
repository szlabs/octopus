package util

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/harbor-incubator/octopus/server/model"
	common_http "github.com/vmware/harbor/src/common/http"
)

type Client struct {
	*common_http.Client
	url string
}

func New(url, username, password string, insecure bool) *Client {
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: insecure,
		},
	}
	return NewWithCustomizedTransport(transport, url, username, password)
}

func NewWithCustomizedTransport(transport *http.Transport, url, username,
	password string) *Client {
	c := &http.Client{
		Transport: transport,
	}
	client := common_http.NewClient(c, &basicAuthModifier{
		username: username,
		password: password,
	})
	cc := &Client{
		url: url,
	}
	cc.Client = client
	return cc
}

type basicAuthModifier struct {
	username string
	password string
}

func (b *basicAuthModifier) Modify(r *http.Request) error {
	r.SetBasicAuth(b.username, b.password)
	return nil
}

func (c *Client) CreateTarget(target *model.Registry) (int64, error) {
	t := &harborTarget{
		Name:     target.Name,
		URL:      target.URL,
		Username: target.Username,
		Password: target.Password,
		Insecure: target.Insecure,
	}
	return c.post("/api/targets", t)
}

func (c *Client) TargetExist(url, username string, insecure bool) (bool, int64, error) {
	targets := []*harborTarget{}
	if err := c.Get(c.url+"/api/targets", &targets); err != nil {
		return false, 0, err
	}
	for _, target := range targets {
		if target.URL == url && target.Username == username &&
			target.Insecure == insecure {
			return true, target.ID, nil
		}
	}
	return false, 0, nil
}

func (c *Client) DeleteTarget(id int64) error {
	return c.Delete(fmt.Sprintf("%s/api/targets/%d", c.url, id))
}

func (c *Client) CreatePolicy(policy *Policy) (int64, error) {
	return c.post("/api/policies/replication", policy)
}

func (c *Client) DeletePolicy(id int64) error {
	return c.Delete(fmt.Sprintf("%s/api/policies/replication/%d", c.url, id))
}

func (c *Client) GetPolicy(id int64) (*Policy, error) {
	policy := &Policy{}
	if err := c.Get(fmt.Sprintf("%s/api/policies/replication/%d", c.url, id), policy); err != nil {
		return nil, err
	}
	return policy, nil
}

func (c *Client) GetJobs(policyID int64) ([]*model.Job, error) {
	u, err := url.Parse(fmt.Sprintf("%s/api/jobs/replication", c.url))
	if err != nil {
		return nil, err
	}
	query := u.Query()
	query.Add("policy_id", strconv.FormatInt(policyID, 10))
	u.RawQuery = query.Encode()
	jobs := []*model.Job{}
	err = c.Get(u.String(), &jobs)
	return jobs, err
}

func (c *Client) GetProjects() ([]*model.Project, error) {
	pros := []struct {
		ID   int64  `json:"project_id"`
		Name string `json:"name"`
	}{}
	if err := c.Get(c.url+"/api/projects", &pros); err != nil {
		return nil, err
	}
	projects := []*model.Project{}
	for _, pro := range pros {
		projects = append(projects, &model.Project{
			ID:   pro.ID,
			Name: pro.Name,
		})
	}
	return projects, nil
}

func (c *Client) Ping(url, username, password string, insecure bool) error {
	target := struct {
		URL      string `json:"endpoint"`
		Username string `json:"username"`
		Password string `json:"password"`
		Insecure bool   `json:"insecure"`
	}{
		URL:      url,
		Username: username,
		Password: password,
		Insecure: insecure,
	}
	return c.Post(c.url+"/api/targets/ping", &target)
}

func (c *Client) post(path string, v interface{}) (int64, error) {
	data, err := json.Marshal(v)
	if err != nil {
		return 0, err
	}
	req, err := http.NewRequest(http.MethodPost, c.url+path, bytes.NewReader(data))
	if err != nil {
		return 0, err
	}
	req.Header.Add("Content-Type", "application/json")
	resp, err := c.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	data, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		return 0, err
	}
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return 0, &common_http.Error{
			Code:    resp.StatusCode,
			Message: string(data),
		}
	}
	location := resp.Header.Get("Location")
	index := strings.LastIndex(location, "/")
	return strconv.ParseInt(location[index+1:], 10, 64)
}
