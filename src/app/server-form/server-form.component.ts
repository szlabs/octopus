import { Component, OnInit } from '@angular/core';
import { RegistryServer } from '../interface/registry-server';
import { RegistryStatus } from '../interface/registry-status.enum';
import { RegistryKind } from '../interface/registry-kind.enum';
import { Guid } from '../utils';
import { Router, ActivatedRoute } from '@angular/router';
import { SlideInOutAnimation } from '../_animations/index';
import { ROUTES } from '../consts';
import { RegistryManagementService } from '../service/registry-management.service';
import { PubSubService } from '../service/pub-sub.service';
import { 
  ALERT_SUCCESS, 
  EVENT_ALERT, 
  EVENT_REGISTRY_LIST_UPDATED,
  EVENT_NODE_REMOVED
 } from '../utils';

const MODE_NEW: string = "NEW";
const MODE_EDIT: string = "EDIT";
const MODE_VIEW: string = "VIEW";

@Component({
  moduleId: module.id.toString(),
  selector: 'app-server-form',
  templateUrl: './server-form.component.html',
  styleUrls: ['./server-form.component.scss'],
  animations: [SlideInOutAnimation],
  host: { '[@SlideInOutAnimation]': '' }
})
export class ServerFormComponent implements OnInit {

  private closed: boolean = true;
  private alertMessage: string = "";
  private alertTicker: any = null;
  private onGoing: boolean = false;
  private mode: string = MODE_NEW;

  title: string = "Add";
  submitted: boolean = false;
  model: RegistryServer = {
    name: "",
    url: "",
    status: RegistryStatus.NEW,
    kind: RegistryKind.UNKNOWN,
    insecure: false
  };
  allKinds: string[] = [RegistryKind.HARBOR, RegistryKind.DOCKER_HUB];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private registryService: RegistryManagementService,
    private pubSub: PubSubService
  ) { }

  ngOnInit() {
    let serverId = this.route.snapshot.params['id'];
    let viewMode = this.route.snapshot.queryParams['view']

    if (serverId) {
      if (viewMode) {
        this.title = "";
        this.mode = MODE_VIEW;
      }else{
        this.title = "Edit";
        this.mode = MODE_EDIT;
      }

      this.registryService.getRegistryServer(serverId)
      .then((registryServer: RegistryServer) => {
        this.onGoing = false
        this.model = registryServer;
      })
      .catch(error => {
        this.onGoing = false;
        this.showError(error);
      });
    }
  }

  onSubmit() {
    if (!this.model || this.onGoing) {
      return;
    }

    if (this.model.kind === RegistryKind.UNKNOWN) {
      this.model.kind = RegistryKind.HARBOR;
    }

    this.onGoing = true;

    if (this.isEditMode) {
      this.updateRegistry();
    } else {
      this.addRegistry();
    }
  }

  cancel() {
    if (this.isViewMode) {
      this.router.navigateByUrl(ROUTES.POLICY_BUILD);
      return;
    }
    this.router.navigateByUrl(ROUTES.HOME)
  }

  public get isEditMode(): boolean {
    return this.mode === MODE_EDIT;
  }

  public get isViewMode(): boolean {
    return this.mode === MODE_VIEW;
  }

  public get toggleText(): string {
    if (this.model && this.model.insecure) {
      return "ON";
    }

    return "OFF";
  }

  private addRegistry(): void {
    this.registryService.createRegistryServer(this.model)
      .then((response: any) => {
        this.onGoing = false;
        this.showSuccess("Registry server " + this.model.name + "(" + response.id + ") is successfully added");
        this.router.navigateByUrl(ROUTES.HOME);
        this.pubSub.publish(EVENT_REGISTRY_LIST_UPDATED, {});
      })
      .catch(error => {
        this.onGoing = false;
        this.showError(error);
      });
  }

  private updateRegistry(): void {
    this.registryService.updateRegistryServer(this.model)
      .then(() => {
        this.onGoing = false;
        this.showSuccess("Registry server " + this.model.name + "(" + this.model.id + ") is successfully updated");
        this.router.navigateByUrl(ROUTES.HOME);
        this.pubSub.publish(EVENT_REGISTRY_LIST_UPDATED, {});
      })
      .catch(error => {
        this.onGoing = false;
        this.showError(error);
      })
  }

  private showSuccess(message: string): void {
    this.pubSub.publish(EVENT_ALERT, {
      alertType: ALERT_SUCCESS,
      data: message
    });
  }

  private showError(error: string): void {
    this.clearAlertTicker();

    this.alertMessage = error;
    this.closed = false;
    this.alertTicker = setTimeout(() => {
      this.clearAlertTicker();
    }, 10000);
  }

  private clearAlertTicker(): void {
    if (this.alertTicker) {
      clearTimeout(this.alertTicker);
      this.alertTicker = null;
    }
  }

  private remove(): void {
    if (this.onGoing) {
      return;
    }

    if (!this.model || !this.model.id){
      return;
    }

    this.pubSub.publish(EVENT_NODE_REMOVED, {id: this.model.id});
    this.router.navigateByUrl(ROUTES.POLICY_BUILD);
  }

}
