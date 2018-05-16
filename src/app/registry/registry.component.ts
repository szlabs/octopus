import { Component, OnInit, OnDestroy } from '@angular/core';
import { RegistryServer } from '../interface/registry-server';
import { RegistryStatus } from '../interface/registry-status.enum';
import { RegistryKind } from '../interface/registry-kind.enum';
import { Router } from '@angular/router';
import { ROUTES } from '../consts';
import { PubSubService } from '../service/pub-sub.service';
import { EVENT_ALERT, EVENT_REGISTRY_LIST_UPDATED, ALERT_DANGER, ALERT_SUCCESS } from '../utils';
import { RegistryManagementService } from '../service/registry-management.service';
import { Subscriber, Subscription } from 'rxjs';

@Component({
  selector: 'app-registry',
  templateUrl: './registry.component.html',
  styleUrls: ['./registry.component.scss']
})
export class RegistryComponent implements OnInit, OnDestroy {

  registries: RegistryServer[] = [];
  private onGoing: boolean = false;
  private subscription: Subscription;

  constructor(
    private router: Router,
    private pubSub: PubSubService,
    private registryService: RegistryManagementService
  ) {
    this.subscription = this.pubSub.on(EVENT_REGISTRY_LIST_UPDATED).subscribe(() => {
      this.refresh();
    });
  }

  private refresh(): void {
    if (this.onGoing) {
      return;
    }

    this.onGoing = true;

    this.registryService.getRegistries()
      .then((registries: RegistryServer[]) => {
        this.onGoing = false;
        if (registries) {
          this.registries = registries;
        }
        this.showSuccess(this.registries.length + " registry servers are loaded");
      })
      .catch(error => {
        this.onGoing = false;
        this.showError('' + error);
      });
  }

  ngOnInit() {
    this.refresh();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  editServer(server: RegistryServer): void {
    this.router.navigateByUrl(ROUTES.EDIT_REGISTRY + "/" + server.id)
  }

  deleteServer(server: RegistryServer): void {
    if (this.onGoing) {
      return;
    }
    if (server && server.id) {
      this.onGoing = true;
      this.registryService.deleteRegistryServer(server.id)
        .then(() => {
          this.onGoing = false;
          let msg: string = "Registry server '" + server.name + "(" + server.id + ")' is successfully deleted";
          this.showSuccess(msg);
          this.refresh();
        })
        .catch(error => {
          this.showError(error);
          this.onGoing = false;
        })
    }
  }

  pingServer(server: RegistryServer): void {
    console.debug("ping", server);
  }

  addServer() {
    this.router.navigateByUrl(ROUTES.ADD_REGISTRY)
  }

  private showError(error: string): void {
    if (!error) {
      return;
    }
    this.pubSub.publish(EVENT_ALERT, {
      alertType: ALERT_DANGER,
      data: error
    });
  }

  private showSuccess(message: string): void {
    if (!message) {
      return;
    }
    this.pubSub.publish(EVENT_ALERT, {
      alertType: ALERT_SUCCESS,
      data: message
    });
  }

}
