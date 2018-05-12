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
import { ALERT_SUCCESS, EVENT_ALERT, EVENT_REGISTRY_LIST_UPDATED } from '../utils';

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
  private onGoing:boolean = false;

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
    if (serverId) {
      this.title = "Edit";
    }
  }

  onSubmit() {
    if (!this.model || this.onGoing) {
      return;
    }

    if (this.model.kind === RegistryKind.UNKNOWN){
      this.model.kind = RegistryKind.HARBOR;
    }

    this.registryService.createRegistryServer(this.model)
    .then((response:any) => {
      this.pubSub.publish(EVENT_ALERT, {
        alertType: ALERT_SUCCESS,
        data: "Registry server " + this.model.name + "(" + response.id + ") is successfully added"
      });
      this.router.navigateByUrl(ROUTES.HOME);
      this.pubSub.publish(EVENT_REGISTRY_LIST_UPDATED, {});
    })
    .catch(error => {
      this.onGoing = false;
      this.showError(error);
    });

  }

  cancel() {
    this.router.navigateByUrl(ROUTES.HOME)
  }

  public get isEditMode(): boolean {
    return this.title === "Edit";
  }

  public get toggleText(): string {
    if (this.model && this.model.insecure) {
      return "ON";
    }

    return "OFF";
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

}
