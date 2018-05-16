import { Component, OnInit, OnDestroy } from '@angular/core';
import { SlideInOutExtAnimation } from '../_animations/index';
import { ROUTES } from '../consts';
import { Router, ActivatedRoute } from '@angular/router';
import { EVENT_VIEW_STATS } from '../utils';
import { PubSubService } from '../service/pub-sub.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-replication-statistics',
  templateUrl: './replication-statistics.component.html',
  styleUrls: ['./replication-statistics.component.scss'],
  animations: [SlideInOutExtAnimation],
  host: { '[@SlideInOutExtAnimation]': '' }
})
export class ReplicationStatisticsComponent implements OnInit, OnDestroy {

  private fromRoute: any = {};
  private subscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pubSub: PubSubService
  ) {
    this.subscription = this.pubSub.on(EVENT_VIEW_STATS).subscribe(data => {
      if (data && data.id) {
        if (!this.fromRoute[data.id]) {
          console.log(data.id);
        }
      }
    });
  }

  ngOnInit() {
    let policyID = this.route.snapshot.params['id'];
    this.fromRoute[policyID] = policyID;
    console.log(policyID);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private back(): void {
    this.router.navigateByUrl(ROUTES.POLICY_BUILD);
  }

}
