import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HTTP_JSON_OPTIONS } from './options';
import { RegistryServer } from '../interface/registry-server';

const REGISTRIES_URL = "/api/v1/registries";

@Injectable()
export class RegistryManagementService {

  constructor(
    private http: Http,
  ) { }


  public getRegistries(): Promise<RegistryServer[]> {
    return this.http.get(REGISTRIES_URL, HTTP_JSON_OPTIONS).toPromise()
    .then(response => response.json() as RegistryServer[])
    .catch(error => Promise.reject(error));
  }

  public createRegistryServer(server: RegistryServer): Promise<any> {
    return this.http.post(REGISTRIES_URL, JSON.stringify(server), HTTP_JSON_OPTIONS).toPromise()
    .then(response => Promise.resolve(response.json()))
    .catch(error => Promise.reject(error));
  }

  public deleteRegistryServer(id: string): Promise<any> {
    return this.http.delete(REGISTRIES_URL + "/" + id, HTTP_JSON_OPTIONS).toPromise()
    .then(() => Promise.resolve({}))
    .catch(error => Promise.reject(error));
  }

  public updateRegistryServer(server: RegistryServer): Promise<any> {
    return this.http.put(REGISTRIES_URL + "/" + server.id, JSON.stringify(server), HTTP_JSON_OPTIONS).toPromise()
    .then(() => Promise.resolve({}))
    .catch(error => Promise.reject(error));
  }

  public getRegistryServer(id: string): Promise<RegistryServer> {
    return this.http.get(REGISTRIES_URL + "/" + id, HTTP_JSON_OPTIONS).toPromise()
    .then(response => response.json() as RegistryServer)
    .catch(error => Promise.reject(error));
  }

}
