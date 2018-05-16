import { RegistryServer } from './registry-server';

export interface Topology {
    nodes: RegistryServer[];
    edges: ConnectedEdge[]
}

export interface ConnectedEdge {
    id: string;
    src_node_id: string;
    dst_node_id: string;
    policy_id: number;
}