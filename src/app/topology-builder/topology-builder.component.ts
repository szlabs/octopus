import { Component, OnInit, OnDestroy } from '@angular/core';
import { Network, DataSet, EdgeOptions, NodeOptions, Node, Edge } from 'vis';
import { PolicyBuilderService } from '../service/policy-builder.service';
import { Topology, ConnectedEdge } from '../interface/topology';
import { PubSubService } from '../service/pub-sub.service';
import { RegistryManagementService } from '../service/registry-management.service';
import {
  EVENT_ALERT,
  ALERT_DANGER,
  EVENT_VIEW_STATS,
  EVENT_CANCEL_CREATING_EDGE,
  EVENT_EDGE_REMOVED,
  EVENT_NODE_REMOVED,
  STATUS_ERROR,
  STATUS_RUNNING,
  STATUS_SUCCESS
} from '../utils';
import { RegistryServer } from '../interface/registry-server';
import { RegistryCandidate } from '../interface/registry-candidate';
import { ROUTES } from '../consts';
import { Router, NavigationExtras } from '@angular/router';
import { Subscription } from 'rxjs';
import { Job, JobStats, JobStatsSummary } from '../interface/replication';

const NETWORK_ID: string = "policy_topology_canvas";
const COLORS: string[] = ["#06c4b7", "#06c49a", "#06c474", "#06c436", "#07c40a"];
const NODE_NOT_ADDABLE: number = 0;
const NODE_ADDABLE: number = 1;
const NODE_ADDED: number = 2;
const REFRESH_INTERVAL = 5000;

@Component({
  selector: 'app-topology-builder',
  templateUrl: './topology-builder.component.html',
  styleUrls: ['./topology-builder.component.scss']
})
export class TopologyBuilderComponent implements OnInit, OnDestroy {
  private network: Network;
  private nodes: DataSet<Node>;
  private edges: DataSet<Edge>;
  private candidates: RegistryCandidate[] = [];
  private topology: Topology;
  private timers: any = {};
  private onGoing: boolean = false;
  private subscription: Subscription;
  private xNodeSubscription: Subscription;
  private xEdgeSubscription: Subscription;
  private refreshTicker: any = null;

  constructor(
    private builderService: PolicyBuilderService,
    private pubSub: PubSubService,
    private registryService: RegistryManagementService,
    private router: Router
  ) {
    this.subscription = this.pubSub.on(EVENT_CANCEL_CREATING_EDGE).subscribe(data => {
      if (data && data.edgeId) {
        this.removeEdge(data.edgeId);
      }
    });

    this.xEdgeSubscription = this.pubSub.on(EVENT_EDGE_REMOVED).subscribe(data => {
      if (data && data.id) {
        this.removeEdge(data.id);
      }
    });
    this.xNodeSubscription = this.pubSub.on(EVENT_NODE_REMOVED).subscribe(data => {
      this.removeNode(data.id);
    });
  }

  ngOnInit() {
    Promise.all([
      this.builderService.getTopology(),
      this.registryService.getRegistries()
    ]).then(data => {
      this.topology = data[0];
      let nodes: RegistryServer[] = [];
      let edges: ConnectedEdge[] = [];
      if (this.topology) {
        nodes = this.topology.nodes;
        edges = this.topology.edges;
      }

      let servers: RegistryServer[] = data[1];
      if (servers && servers.length > 0) {
        servers.forEach(s => {
          let candidate: RegistryCandidate = {
            server: s,
            added: false
          };
          if (nodes.length > 0) {
            let foundOnes = nodes.filter(n => n.id === s.id)
            if (foundOnes && foundOnes.length > 0) {
              candidate.added = true;
            }
          }
          this.candidates.push(candidate);
        });
      }

      //initialize network
      this.initNetwork();
      nodes.forEach(r => {
        this.nodes.add({
          id: r.id,
          label: r.name
        });
      });
      edges.forEach(e => {
        this.edges.add({
          id: e.id,
          from: e.src_node_id,
          to: e.dst_node_id
        });
      });

      this.network.redraw();
      this.network.fit();
      console.log("network initialized");

      this.getTopologyStatus();
      this.startStatusMonitor();
    })
      .catch(error => {
        this.showError('' + error);
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.network.off("doubleClick");
    if (this.timers) {
      for (let k of Object.keys(this.timers)) {
        clearInterval(this.timers[k]);
      }
    }
  }

  private startStatusMonitor(): void {
    if (this.refreshTicker) {
      clearInterval(this.refreshTicker);
      this.refreshTicker = null;
    }

    this.refreshTicker = setInterval(() => {
      this.getTopologyStatus();
    }, REFRESH_INTERVAL);
  }

  private getTopologyStatus(): void {
    this.builderService.getTopologyStats()
      .then(data => {
        if (data) {
          let summary: JobStatsSummary<JobStats> = {};
          for (let k of Object.keys(data)) {
            let edge: Edge = this.edges.get(k);
            if (edge) {
              let id: string = '' + edge.to;
              if (!summary[id]) {
                summary[id] = {
                  total: 0,
                  runningOnes: 0,
                  failedOnes: 0,
                  successOnes: 0
                };
              }
              let jobStats: JobStats = this.getStatsFromJobs(data[k]);
              //change color of edge
              if (jobStats.runningOnes > 0) {
                //this.network.updateEdge(k, {color: "#07c40a"});
              }else {
                if (jobStats.failedOnes > 0) {
                  //this.network.updateEdge(k, {color: "#ed3507"});
                }else{
                  if (jobStats.total != 0 && jobStats.total === jobStats.successOnes) {
                    edge.color = "#72ed07";
                    //this.edges.update(edge);
                    //console.log(this.network);
                    //this.network.updateEdge(k, {color: "#72ed07"});
                  }
                }
              }
              summary[id].total += jobStats.total;
              summary[id].runningOnes += jobStats.runningOnes;
              summary[id].failedOnes += jobStats.failedOnes;
              summary[id].successOnes += jobStats.successOnes;
            }
          }

          for (let k of Object.keys(summary)) {
            let stats: JobStats = summary[k];
            if (stats.runningOnes > 0) {
              this.setInProgress(k);
              continue;
            }

            if (stats.failedOnes > 0) {
              this.setFailure(k);
              continue;
            }

            if (stats.total !== 0 && stats.successOnes === stats.total) {
              this.setSuccess(k);
              continue;
            }
          }
        }
      })
      .catch(error => this.showError('' + error));
  }

  private getStatsFromJobs(jobs: Job[]): JobStats {
    let stats: JobStats = {
      total: 0,
      runningOnes: 0,
      failedOnes: 0,
      successOnes: 0
    };
    if (jobs && jobs.length > 0) {
      jobs.forEach((j: Job) => {
        switch (j.status) {
          case STATUS_RUNNING:
            stats.runningOnes++;
            break;
          case STATUS_SUCCESS:
            stats.successOnes++;
            break;
          case STATUS_ERROR:
            stats.failedOnes++;
            break;
          default:
            break;
        }
      });

      stats.total = jobs.length;
    }

    return stats;
  }

  private setInProgress(id: string): void {
    if (this.nodes.get(id)) {
      this.clearTicker(id);
      let t = setInterval(() => {
        let node = this.nodes.get(id);
        if (node) {
          let theColor = COLORS.findIndex(c => node.color === c);
          theColor++;
          theColor = theColor % COLORS.length;
          node.color = COLORS[theColor];
          this.nodes.update(node);
        }
      }, 200);
      this.timers[id] = t;
    }
  }

  private setFailure(id: string): void {
    let node = this.nodes.get(id);
    if (node) {
      this.clearTicker(id);
      node.color = "#ed3507";
      this.nodes.update(node);
    }
  }

  private setSuccess(id: string): void {
    let node = this.nodes.get(id);
    if (node) {
      this.clearTicker(id);
      node.color = "#72ed07";
      this.nodes.update(node);
    }
  }

  private clearTicker(id: string): void {
    if (this.timers && this.timers[id]) {
      clearInterval(this.timers[id]);
      delete (this.timers[id]);
    }
  }

  private initNetwork(): void {
    this.nodes = new DataSet([]);
    this.edges = new DataSet([]);
    let canvas = document.getElementById(NETWORK_ID);
    let data = {
      nodes: this.nodes,
      edges: this.edges
    };

    let edgeOptions: EdgeOptions = {
      arrows: {
        from: {
          enabled: true,
          type: 'bar'
        },
        to: {
          enabled: true,
          type: 'arrow'
        }
      },
      shadow: true,
      width: 3,
      selectionWidth: 5,
      length: 500,
      color: {
        inherit: 'to'
      },
      smooth: {
        enabled: true,
        type: "dynamic",
        forceDirection: "vertical",
        roundness: 1
      }
    };
    let nodeOptions: NodeOptions = {
      shape: "circle",
      borderWidth: 2,
      borderWidthSelected: 5,
      color: {
        background: "#07d6ed",
        border: "#07afed",
        highlight: {
          border: "#e2610b",
          background: "#ed8d07"
        },
        hover: {
          border: "#e2610b",
          background: "#ed8d07"
        }
      }
    };
    let that = this;
    let options = {
      height: '600px',
      width: '100%',
      layout: {
        randomSeed: 8,
        hierarchical: {
          enabled: false,
          direction: 'UD',
          sortMethod: 'directed',
          levelSeparation: 300,
          nodeSpacing: 200
        }
      },
      interaction: {
        hover: true,
        selectConnectedEdges: false,
        navigationButtons: true,
        keyboard: true
      },
      manipulation: {
        addEdge: function (data, callback) {
          if (data.from != data.to) {
            that.onAddEdge(data, callback);
          }
        }
      },
      edges: edgeOptions,
      nodes: nodeOptions
    };

    this.network = new Network(canvas, data, options);
    this.network.on("doubleClick", (data) => {
      if (data) {
        if (data.nodes && data.nodes.length > 0) {
          this.viewNode(data.nodes[0]);
          return;
        }

        if (data.edges && data.edges.length > 0) {
          this.viewEdge(data.edges[0]);
        }
      }
    });
    this.network.on("selectNode", (data) => {
      this.network.addEdgeMode();
    });
    this.network.on("deselectNode", (data) => {
      this.network.disableEditMode();
    });
    this.network.on("selectEdge", (data) => {
      if (data.edges && data.edges.length > 0) {
        this.viewStats(data.edges[0]);
      }
    });
    this.network.on("deselectEdge", (data) => {
      this.router.navigateByUrl(ROUTES.POLICY_BUILD);
    });
  }

  private getNodeMode(rc: RegistryCandidate): number {
    if (rc && rc.server) {
      if (rc.server.status === 'healthy') {
        if (!rc.added) {
          return NODE_ADDABLE;
        }

        return NODE_ADDED;
      }
    }

    return NODE_NOT_ADDABLE;
  }

  private onAddEdge(data: any, callback): void {
    let twoNodes: RegistryCandidate[] = this.candidates.filter((item: RegistryCandidate) => item.server.id === data.from || item.server.id === data.to);
    if (!twoNodes || twoNodes.length !== 2) {
      this.showError("seems the data is not valid");
      callback(null);
      return;
    }

    callback(data);

    let srcNodeName: string = twoNodes[0].server.name;
    let destNodeName: string = twoNodes[1].server.name;
    if (twoNodes[0].server.id !== data.from) {
      let tmp: string = srcNodeName;
      srcNodeName = destNodeName;
      destNodeName = tmp;
    }

    let extras: NavigationExtras = {
      queryParams: {
        "src": data.from,
        "dest": data.to,
        "src_node": btoa(srcNodeName),
        "dest_node": btoa(destNodeName)
      }
    };
    this.router.navigate([ROUTES.POLICY_EDGE, data.id], extras);
  }

  private viewEdge(id: string) {
    let edge = this.edges.get(id);
    if (!edge) {
      console.error("edge ", id, " is not found")
      return;
    }

    let twoNodes: RegistryCandidate[] = this.candidates.filter((item: RegistryCandidate) => item.server.id === edge.from || item.server.id === edge.to);
    if (!twoNodes || twoNodes.length !== 2) {
      console.error("seems the edge is not valid");
      return;
    }

    let srcNodeName: string = twoNodes[0].server.name;
    let destNodeName: string = twoNodes[1].server.name;
    if (twoNodes[0].server.id !== edge.from) {
      let tmp: string = srcNodeName;
      srcNodeName = destNodeName;
      destNodeName = tmp;
    }

    let extras: NavigationExtras = {
      queryParams: {
        "src_node": btoa(srcNodeName),
        "dest_node": btoa(destNodeName)
      }
    };

    this.router.navigate([ROUTES.POLICY_EDGE, id], extras);
  }

  private onAdd(rc: RegistryCandidate): void {
    if (this.onGoing) {
      return;
    }

    if (this.getNodeMode(rc) !== NODE_ADDABLE) {
      return;
    }

    this.builderService.addNode(rc.server)
      .then(() => {
        this.onGoing = false;
        this.nodes.add({
          id: rc.server.id,
          label: rc.server.name
        });
        rc.added = true;
      })
      .catch(error => {
        this.onGoing = false;
        this.showError(error);
      });
  }

  private viewNode(id: string): void {
    this.router.navigateByUrl(ROUTES.POLICY_NODE + '/' + id + '?view=true');
  }

  private viewStats(id: string): void {
    this.router.navigateByUrl(ROUTES.POLICY_STATS + '/' + id);
    this.pubSub.publish(EVENT_VIEW_STATS, { id: id });
  }

  private showError(message: string): void {
    this.pubSub.publish(EVENT_ALERT, {
      alertType: ALERT_DANGER,
      data: message
    });
  }

  private refresh(): void {
    this.network.fit();
  }

  private removeNode(id: string) {
    if (this.nodes.get(id)) {
      this.nodes.remove(id);
      let foundOne = this.candidates.find((item: RegistryCandidate) => item.server.id === id);
      if (foundOne) {
        foundOne.added = false;
      }
    }
  }

  private removeEdge(id: string) {
    if (this.edges.get(id)) {
      this.edges.remove(id);
    }
  }
}
