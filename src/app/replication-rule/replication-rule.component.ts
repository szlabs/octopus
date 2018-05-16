import { Component, OnInit } from '@angular/core';
import { SlideInOutAnimation } from '../_animations/index';
import { EdgeRequest, Project } from '../interface/replication';
import { ROUTES } from '../consts';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { getOfftime, setOfftime, EVENT_CANCEL_CREATING_EDGE } from '../utils';
import { PolicyBuilderService } from '../service/policy-builder.service';
import { PubSubService } from '../service/pub-sub.service';

@Component({
  selector: 'app-replication-rule',
  templateUrl: './replication-rule.component.html',
  styleUrls: ['./replication-rule.component.scss'],
  animations: [SlideInOutAnimation],
  host: { '[@SlideInOutAnimation]': '' }
})
export class ReplicationRuleComponent implements OnInit {

  private closed: boolean = true;
  private alertMessage: string = "";
  private ticker: any = null;
  private model: EdgeRequest = {
    src_node_id: "",
    dst_node_id: "",
    policy: {
      project_id: -1,
      replicate_deletion: true,
      filters: [],
      trigger: {
        kind: "Manual",
        schedule_param: {//for placeholder
          type: "Daily",
          weekday: 1,
          offtime: 0
        }
      }
    }
  };
  private projectList: Project[] = [];
  private allDays: any[] = [
    { v: 1, day: "Monday" },
    { v: 2, day: "Tuesday" },
    { v: 3, day: "Wednesday" },
    { v: 4, day: "Thursday" },
    { v: 5, day: "Friday" },
    { v: 6, day: "Saturday" },
    { v: 7, day: "Sunday" },
  ];
  private edgeId: string = "";
  private isCreatingEdge: boolean = false;
  private srcNodeName: string = "";
  private destNodeName: string = "";
  private onGoing: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private builderService: PolicyBuilderService,
    private pubSub: PubSubService
  ) { }

  ngOnInit() {
    this.edgeId = this.route.snapshot.params['id'];
    let srcNode = this.route.snapshot.queryParams['src'];
    if (srcNode) {
      this.model.src_node_id = srcNode;
    }
    let destNode = this.route.snapshot.queryParams['dest'];
    if (destNode) {
      this.model.dst_node_id = destNode;
    }

    if (srcNode && destNode) {
      this.isCreatingEdge = true;
      let srcNodeName: string = this.route.snapshot.queryParams['src_node'];
      let destNodeName: string = this.route.snapshot.queryParams['dest_node'];
      if (srcNodeName) {
        srcNodeName = atob(srcNodeName);
      }
      if (destNodeName) {
        destNodeName = atob(destNodeName);
      }

      this.srcNodeName = srcNodeName || srcNode;
      this.destNodeName = destNodeName || destNode;
    }

    if (this.isCreatingEdge) {
      this.builderService.getProjectList(this.model.src_node_id)
      .then((proList: Project[]) => {
        this.projectList = proList;
        if (this.projectList && this.projectList.length > 0) {
          this.model.policy.project_id = this.projectList[0].id;
        }
      })
      .catch(error => this.showError('' + error));
    }
  }

  public get toggleText(): string {
    if (this.model && this.model.policy && this.model.policy.replicate_deletion) {
      return "ON";
    } else {
      return "OFF";
    }
  }

  public get isImmediateMode(): boolean {
    return this.model &&
      this.model.policy &&
      this.model.policy.trigger &&
      this.model.policy.trigger.kind === "Immediate";
  }

  public get isScheduledMode(): boolean {
    return this.model &&
      this.model.policy &&
      this.model.policy.trigger &&
      this.model.policy.trigger.kind === "Scheduled";
  }

  public get isWeeklySchedule(): boolean {
    return this.isScheduledMode &&
      this.model.policy.trigger.schedule_param &&
      this.model.policy.trigger.schedule_param.type === "Weekly";
  }

  public get triigerKind(): string {
    if (this.model && this.model.policy && this.model.policy.trigger) {
      if (this.model.policy.trigger.kind) {
        return this.model.policy.trigger.kind;
      }
    }

    return "Manual";
  }

  public set triigerKind(v: string) {
    if (v) {
      if (this.model && this.model.policy && this.model.policy.trigger) {
        this.model.policy.trigger.kind = v;
      }
    }
  }

  public get scheduleKind(): string {
    if (this.model &&
      this.model.policy &&
      this.model.policy.trigger &&
      this.model.policy.trigger.schedule_param) {
      return this.model.policy.trigger.schedule_param.type;
    }

    return "Daily";
  }

  public set scheduleKind(v: string) {
    if (v) {
      if (this.model &&
        this.model.policy &&
        this.model.policy.trigger &&
        this.model.policy.trigger.schedule_param) {
        this.model.policy.trigger.schedule_param.type = v;
      }
    }
  }

  public get scheduleDay(): number {
    if (this.model &&
      this.model.policy &&
      this.model.policy.trigger &&
      this.model.policy.trigger.schedule_param) {
      return this.model.policy.trigger.schedule_param.weekday;
    }

    return 1;
  }

  public set scheduleDay(v: number) {
    if (v) {
      if (this.model &&
        this.model.policy &&
        this.model.policy.trigger &&
        this.model.policy.trigger.schedule_param) {
        this.model.policy.trigger.schedule_param.weekday = v;
      }
    }
  }

  public get scheduleOffTime(): string {
    if (this.model &&
      this.model.policy &&
      this.model.policy.trigger &&
      this.model.policy.trigger.schedule_param) {
        return getOfftime(this.model.policy.trigger.schedule_param.offtime);
    }

    return "00:00";
  }

  public set scheduleOffTime(v: string) {
    if (this.model &&
      this.model.policy &&
      this.model.policy.trigger &&
      this.model.policy.trigger.schedule_param) {
        this.model.policy.trigger.schedule_param.offtime = setOfftime(v);
    }
  }

  private showError(error: string): void {
    if (this.ticker) {
      clearTimeout(this.ticker);
    }
    this.alertMessage = error;
    this.closed = false;
    this.ticker = setTimeout(() => {
      this.alertMessage = "";
      this.closed = true;
    }, 10000);
  }

  private onSubmit(): void {
    if (this.onGoing) {
      return;
    }

    if (this.model.src_node_id === "" || this.model.dst_node_id === "") {
      this.showError("malformed topology data: source or destination registry is not set");
      return;
    }

    if (this.model.policy.project_id === -1) {
      this.showError("malformed topology data: src project is not set");
      return;
    }

    this.builderService.addEdge(this.model)
    .then(res => {
      this.router.navigateByUrl(ROUTES.POLICY_BUILD);
    })
    .catch(error => {
      this.onGoing = false;
      this.showError(''+error);
    });
  }

  private cancel(): void {
    if (this.isCreatingEdge){
      this.pubSub.publish(EVENT_CANCEL_CREATING_EDGE, {edgeId: this.edgeId});
    }
    this.router.navigateByUrl(ROUTES.POLICY_BUILD);
  }

}
