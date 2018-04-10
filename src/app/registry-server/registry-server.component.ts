import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RegistryServer } from '../interface/registry-server';
import { RegistryKind } from '../interface/registry-kind.enum';
import { RegistryStatus } from '../interface/registry-status.enum';
import { FadeInAnimation } from '../_animations/index';

@Component({
  selector: 'app-registry-server',
  templateUrl: './registry-server.component.html',
  styleUrls: ['./registry-server.component.scss'],
  animations: [FadeInAnimation],
  host: { '[@FadeInAnimation]': '' }
})
export class RegistryServerComponent implements OnInit {
  
  @Input() data: RegistryServer;
  onGoing: boolean = false;
  @Output() editServer: EventEmitter<RegistryServer> = new EventEmitter<RegistryServer>();
  @Output() deleteServer: EventEmitter<RegistryServer> = new EventEmitter<RegistryServer>();
  @Output() pingServer: EventEmitter<RegistryServer> = new EventEmitter<RegistryServer>();

  constructor() { }

  ngOnInit() {
  }

  public get imgSrc(): string{
  	if (this.data.kind === RegistryKind.HARBOR){
  		return "../images/harbor-logo.png"
  	}

  	return "";//not supported now
  }

  public get createTime(): string {
  	if (this.data && this.data.createTime){
  		return this.data.createTime.toLocaleString();
  	}

  	return "n/a";
  }

  public get isHealthy(): boolean{
  	return this.data.status === RegistryStatus.HEALTHY;
  }

  public get progressClass(): string {
  	if (this.onGoing){
  		return "loop";
  	}

  	if (this.isHealthy){
  		return "success";
  	}else{
  		return "danger";
  	}
  }

  edit(): void {
  	this.editServer.emit(this.data);
  }

  delete(): void {
  	this.deleteServer.emit(this.data);
  }

  ping(): void {
  	this.pingServer.emit(this.data);
  }

}
