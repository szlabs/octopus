import { Component, OnInit, OnDestroy } from '@angular/core';
import { SlideInOutExtAnimation } from '../_animations/index';
import { ROUTES } from '../consts';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  EVENT_VIEW_STATS,
  STATUS_ERROR,
  STATUS_RUNNING,STATUS_SUCCESS
 } from '../utils';
import { PubSubService } from '../service/pub-sub.service';
import { Subscription } from 'rxjs';
import { PolicyBuilderService } from '../service/policy-builder.service';
import { Job } from '../interface/replication';

@Component({
  selector: 'app-replication-statistics',
  templateUrl: './replication-statistics.component.html',
  styleUrls: ['./replication-statistics.component.scss'],
  animations: [SlideInOutExtAnimation],
  host: { '[@SlideInOutExtAnimation]': '' }
})
export class ReplicationStatisticsComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  private onGoing: boolean = false;
  private closed: boolean = true;
  private alertMessage: string = "";
  private alertTicker: any = null;

  private total: number = 0;
  private runningOnes: number = 0;
  private successOnes: number = 0;
  private errorOnes: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pubSub: PubSubService,
    private builderService: PolicyBuilderService
  ) {
    this.subscription = this.pubSub.on(EVENT_VIEW_STATS).subscribe(data => {
      if (data && data.id) {
        this.loadData(data.id);
      }
    });
  }

  ngOnInit() {
    let policyID = this.route.snapshot.params['id'];
    this.loadData(policyID);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private back(): void {
    this.router.navigateByUrl(ROUTES.POLICY_BUILD);
  }

  private loadData(id: string) {
    if (!id || this.onGoing) {
      return;
    }

    this.onGoing = true;
    this.builderService.getEdgeStats(id)
      .then((jobs: Job[]) => {
        this.onGoing = false;

        let list: Job[] = jobs || [];
        this.total = list.length;

        let runningCounter: number = 0;
        let successCounter: number = 0;
        let errorCounter: number = 0;
        jobs.forEach((j: Job) => {
          switch (j.status) {
            case STATUS_RUNNING:
              runningCounter++;
              break;
            case STATUS_SUCCESS:
              successCounter++;
              break;
            case STATUS_ERROR:
              errorCounter++;
              break;
            default:
              break;
          }
        });

        this.successOnes = successCounter;
        this.runningOnes = runningCounter;
        this.errorOnes = errorCounter;
      })
      .catch(error => {
        this.onGoing = false;
        this.showError('' + error);
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

}
