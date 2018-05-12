import { Component, OnInit } from '@angular/core';
import { RegistryServer } from '../interface/registry-server';
import { RegistryStatus } from '../interface/registry-status.enum';
import { RegistryKind } from '../interface/registry-kind.enum';
import { Router } from '@angular/router';
import { ROUTES } from '../consts';
import { PubSubService } from '../service/pub-sub.service';
import { EVENT_ALERT, EVENT_REGISTRY_LIST_UPDATED, ALERT_DANGER, ALERT_SUCCESS } from '../utils';
import { RegistryManagementService } from '../service/registry-management.service';

@Component({
  selector: 'app-registry',
  templateUrl: './registry.component.html',
  styleUrls: ['./registry.component.scss']
})
export class RegistryComponent implements OnInit {

  registries: RegistryServer[] = [];

  constructor(
    private router: Router,
    private pubSub: PubSubService,
    private registryService: RegistryManagementService
  ) { 
    this.pubSub.on(EVENT_REGISTRY_LIST_UPDATED).subscribe(() => {
      this.refresh();
    });
  }

  private refresh():void {
    this.registryService.getRegistries()
      .then((registries: RegistryServer[]) => {
        if (registries && registries.length > 0) {
          this.registries = registries;
        }
        this.pubSub.publish(EVENT_ALERT, {
          alertType: ALERT_SUCCESS,
          data: this.registries.length + " registry servers are loaded"
        });
      })
      .catch(error => {
        this.pubSub.publish(EVENT_ALERT, {
          alertType: ALERT_DANGER,
          data: '' + error
        });
      });
  }

  ngOnInit() {
    this.refresh();
  }

  editServer(server: RegistryServer): void {
    this.router.navigateByUrl(ROUTES.EDIT_REGISTRY + "/" + server.id)
  }

  deleteServer(server: RegistryServer): void {
    console.debug("delete", server);
  }

  pingServer(server: RegistryServer): void {
    console.debug("ping", server);
  }

  addServer() {
    this.router.navigateByUrl(ROUTES.ADD_REGISTRY)
  }

}
