import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Topology } from '../interface/topology';
import { HTTP_JSON_OPTIONS } from './options';
import { RegistryServer } from '../interface/registry-server';
import { Project } from '../interface/replication';
import { EdgeRequest, Job } from '../interface/replication';

const TOPOLOGY_URL = "/api/v1/topology";
const TOPOLOGY_NODES_URL = "/api/v1/topology/nodes";
const PROJECT_LIST = "/api/v1/registries/{id}/projects";
const TOPOLOGY_EDGES_URL = "/api/v1/topology/edges";
const TOPOLOGY_EDGE_STATS = "/api/v1/topology/edges/{id}/status";
const TOPOLOGY_STATS = "/api/v1/topology/status";

@Injectable()
export class PolicyBuilderService {

  constructor(
    private http: Http
  ) { }

  public getTopology(): Promise<Topology> {
    return this.http.get(TOPOLOGY_URL, HTTP_JSON_OPTIONS).toPromise()
    .then(response => response.json() as Topology)
    .catch(error => Promise.reject(error));
  }

  public addNode(registry: RegistryServer): Promise<any> {
    return this.http.post(TOPOLOGY_NODES_URL, JSON.stringify(registry), HTTP_JSON_OPTIONS).toPromise()
    .then(() => Promise.resolve(true))
    .catch(error => Promise.reject(error));
  }

  public removeNode(id: string): Promise<any> {
    return this.http.delete(TOPOLOGY_NODES_URL + '/' + id, HTTP_JSON_OPTIONS).toPromise()
    .then(() => Promise.resolve(true))
    .catch(error => Promise.reject(error));
  }

  public getProjectList(id: string): Promise<Project[]> {
    return this.http.get(PROJECT_LIST.replace("{id}", id), HTTP_JSON_OPTIONS).toPromise()
    .then(response => response.json() as Project[])
    .catch(error => Promise.reject(error));
  }

  public addEdge(edgeReq: EdgeRequest): Promise<any> {
    return this.http.post(TOPOLOGY_EDGES_URL, JSON.stringify(edgeReq), HTTP_JSON_OPTIONS).toPromise()
    .then(response => Promise.resolve(response.json()))
    .catch(error => Promise.reject(error));
  }

  public getEdge(id: string): Promise<EdgeRequest> {
    return this.http.get(TOPOLOGY_EDGES_URL + '/' + id, HTTP_JSON_OPTIONS).toPromise()
    .then(response => response.json() as EdgeRequest)
    .catch(error => Promise.reject(error));
  }

  public removeEdge(id: string): Promise<any> {
    return this.http.delete(TOPOLOGY_EDGES_URL + '/' + id, HTTP_JSON_OPTIONS).toPromise()
    .then(() => Promise.resolve(true))
    .catch(error => Promise.reject(error));
  }

  public getEdgeStats(id: string): Promise<Job[]> {
    return this.http.get(TOPOLOGY_EDGE_STATS.replace("{id}", id), HTTP_JSON_OPTIONS).toPromise()
    .then(response => response.json() as Job[])
    .catch(error => Promise.reject(error));
  }

  public getTopologyStats(): Promise<any> {
    return this.http.get(TOPOLOGY_STATS, HTTP_JSON_OPTIONS).toPromise()
    .then(response => Promise.resolve(response.json()))
    .catch(error => Promise.reject(error));
  }

}
