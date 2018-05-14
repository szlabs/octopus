import { Component, OnInit } from '@angular/core';
import { PubSubService } from '../service/pub-sub.service';
import { EVENT_OPEN_MODAL, EVENT_MODAL_CONFIRM } from '../utils';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {

  private opened:boolean = false;
  private modalTitle: string = "<NOT SET>";
  private message: string = "<NO CONTENT>";
  private extraData: any = null;

  constructor(
    private pubSub: PubSubService
  ) { 
    this.pubSub.on(EVENT_OPEN_MODAL).subscribe(data => {
      if (data) {
        this.modalTitle = data.messageTitle;
        this.message = data.message;
        this.extraData = data.extraData;
        this.opened = true;
      }
    });
  }

  ngOnInit() {
  }

  public doOk(): void {
    this.pubSub.publish(EVENT_MODAL_CONFIRM, this.extraData);

    this.modalTitle = "<NOT SET>";
    this.message = "<NO CONTENT>";
    this.opened = false;
  }

}
