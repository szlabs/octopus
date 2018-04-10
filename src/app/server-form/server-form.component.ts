import { Component, OnInit } from '@angular/core';
import { RegistryServer } from '../interface/registry-server';
import { RegistryStatus } from '../interface/registry-status.enum';
import { RegistryKind } from '../interface/registry-kind.enum';
import { Guid } from '../utils';
import { Router, ActivatedRoute } from '@angular/router';
import { SlideInOutAnimation } from '../_animations/index';
import { ROUTES } from '../consts';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-server-form',
  templateUrl: './server-form.component.html',
  styleUrls: ['./server-form.component.scss'],
  animations: [SlideInOutAnimation],
  host: { '[@SlideInOutAnimation]': '' }
})
export class ServerFormComponent implements OnInit {
  
  title:string = "Add";
  submitted: boolean = false;
  model: RegistryServer = {
  	ID: Guid(),
  	name: "",
  	address: "",
  	status: RegistryStatus.NEW,
  	kind: RegistryKind.UNKNOWN,
  	createTime: new Date()
  };
  allKinds: string[]=[RegistryKind.HARBOR, RegistryKind.DOCKER_HUB];

  constructor(
  	private route: ActivatedRoute,
  	private router: Router
  	) { }

  ngOnInit() {
  	let serverId = Number(this.route.snapshot.params['id']);
    if (serverId) {
      this.title = "Edit";
    }
  }

  onSubmit(){
  	console.debug("submit");
  }

  cancel(){
  	this.router.navigateByUrl(ROUTES.HOME)
  }

}
