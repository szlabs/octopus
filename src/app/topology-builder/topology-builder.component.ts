import { Component, OnInit, OnDestroy } from '@angular/core';
import {
	VisNode, 
	VisNodes,
	VisEdges,
	VisNetworkService,
	VisNetworkOptions,
	VisNetworkData,
	VisDataSetOptions
} from 'ng2-vis';

class ExampleNetworkData implements VisNetworkData {
    public nodes: VisNodes;
    public edges: VisEdges;
}

@Component({
  selector: 'app-topology-builder',
  templateUrl: './topology-builder.component.html',
  styleUrls: ['./topology-builder.component.scss']
})
export class TopologyBuilderComponent implements OnInit, OnDestroy {
  
  public visNetwork: string = 'topology-builder';
  public visNetworkData: ExampleNetworkData;
  public visNetworkOptions: VisNetworkOptions;

  constructor(
  	private visNetworkService: VisNetworkService
  	) { }

  ngOnInit() {
  	const setOptions: VisDataSetOptions = {};

  	const nodes = new VisNodes([
    { id: '1', label: '10.112.122.111' },
    { id: '2', label: 'Node 2' },
    { id: '3', label: 'Node 3' },
    { id: '4', label: 'Node 4' },
    { id: '5', label: 'Node 5', title: 'Title of Node 5' }]);

	const edges = new VisEdges([
	    { from: '1', to: '3'},
	    { from: '1', to: '2' },
	    { from: '2', to: '4' },
	    { from: '2', to: '5' }]);

	this.visNetworkData = {
	    nodes,
	    edges,
	};

	this.visNetworkOptions = {
		layout:{
			improvedLayout: true,
		},
		interaction: {
          navigationButtons: true,
          keyboard: true
        },
        nodes:{
          shape: "circle",
          borderWidth: 0,
          borderWidthSelected: 2
        },
        edges: {
        	arrows: {
        		from:{
        			enabled: true,
        			type: 'circle'
        		},
        		to: {
        			enabled: true,
        			type: 'arrow'
        		}
        	},
        	shadow: true,
        	smooth: true,
        	width: 3,
        	length: 300
        },
        manipulation: {
        	addEdge: function (data, callback) {
        		if (data.from != data.to) {
        			callback(data);
        		}
        	}
        }
	};
  }

  ngOnDestroy(){
    this.visNetworkService.off(this.visNetwork, 'click');
    this.visNetworkService.off(this.visNetwork, 'selectNode');
    this.visNetworkService.off(this.visNetwork, 'deselectNode');
  }

  onAdd(){
  	this.visNetworkService.enableEditMode(this.visNetwork);
  	const newId = this.visNetworkData.nodes.getLength() + 1;
    this.visNetworkData.nodes.add({ id: newId.toString(), label: 'Node ' + newId });
    this.visNetworkService.fit(this.visNetwork);
    this.visNetworkService.addEdgeMode(this.visNetwork);
  }

  public networkInitialized(): void {
    // now we can use the service to register on events
    this.visNetworkService.on(this.visNetwork, 'click');
    this.visNetworkService.on(this.visNetwork, 'selectNode');
    this.visNetworkService.on(this.visNetwork, 'deselectNode');

    // open your console/dev tools to see the click params
    this.visNetworkService.click
        .subscribe((eventData: any[]) => {
            if (eventData[0] === this.visNetwork) {
              //console.log(eventData[1]);
            }
        });
    //enable add edge mode when node is selected
    this.visNetworkService.selectNode.subscribe((eventData: any[])=>{
    	if (eventData[0] === this.visNetwork) {
    		this.visNetworkService.addEdgeMode(this.visNetwork);
    		console.debug("addEdgeMode");
    	}
    });

    this.visNetworkService.deselectNode.subscribe((eventData: any[])=>{
    	if (eventData[0] === this.visNetwork) {
    		this.visNetworkService.disableEditMode(this.visNetwork);
    		console.debug("disableEditMode")
    	}
    });

    };

}
