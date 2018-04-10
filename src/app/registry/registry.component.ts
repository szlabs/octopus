import { Component, OnInit } from '@angular/core';
import { RegistryServer } from '../interface/registry-server';
import { RegistryStatus } from '../interface/registry-status.enum';
import { RegistryKind } from '../interface/registry-kind.enum';
import { Router } from '@angular/router';
import { ROUTES } from '../consts';

@Component({
  selector: 'app-registry',
  templateUrl: './registry.component.html',
  styleUrls: ['./registry.component.scss']
})
export class RegistryComponent implements OnInit {
  
  registries: RegistryServer[] = [];

  constructor(
    private router: Router
    ) { }

  ngOnInit() {
  	//mock some data
  	for (let i = 9; i >= 0; i--) {
  		let id: number = 10000+i;
  		let serv: RegistryServer = {
  			ID: "srv"+id,
  	        name: "harbor@beijing"+i,
  	        address: "https://10.112.122.122/harbor",
		  	status: RegistryStatus.HEALTHY,
		  	createTime: new Date(),
		  	kind: RegistryKind.HARBOR
  		};
  		this.registries.push(serv)
  	}
  }

  editServer(server: RegistryServer): void {
    this.router.navigateByUrl(ROUTES.EDIT_REGISTRY+"/"+server.ID)
  }

  deleteServer(server: RegistryServer): void {
  	console.debug("delete", server);
  }

  pingServer(server: RegistryServer): void {
  	console.debug("ping", server);
  }

  addServer(){
    this.router.navigateByUrl(ROUTES.ADD_REGISTRY)
  }

}
