import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AboutComponent } from '../about/about.component';
import { ROUTES } from '../consts';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { AppUser } from '../interface/app-user';
import { PubSubService } from '../service/pub-sub.service';
import { EVENT_ALERT, ALERT_DANGER, ALERT_SUCCESS } from '../utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit, OnDestroy {

  @ViewChild(AboutComponent) aboutDlg: AboutComponent;

  loggedUser: AppUser = null;

  private closed: boolean = true;
  private alertType: string = ALERT_SUCCESS;
  private alertMessage: string = "";
  private alertTicker: any = null;
  private subscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private pubSub: PubSubService
  ) { 
    this.subscription = this.pubSub.on(EVENT_ALERT).subscribe((message: any) => {
      if (message.alertType) {
        this.showMessage(message.alertType, message.data);
      }
    });
  }

  public get user(): string {
    if (this.loggedUser) {
      return this.loggedUser.userName + " (" + this.loggedUser.email + ")";
    }

    return "anonymous_user"
  }

  ngOnInit() {
    this.loggedUser = this.authService.getCurrentUser();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  about() {
    this.aboutDlg.open();
  }

  logOut() {
    this.authService.logOut()
      .then(() => {
        this.router.navigateByUrl(ROUTES.LOGIN);
      })
      .catch(error => console.error(error));
  }

  private showMessage(alertType: string, message: string): void {
    if (this.alertTicker) {
      clearTimeout(this.alertTicker);
      this.alertTicker = null;
    }

    this.alertMessage = message;
    this.alertType = alertType;
    this.closed = false;

    this.alertTicker = setTimeout(() => {
      this.closed = true;
      this.alertMessage = "";
    }, 10000);
  }

}
