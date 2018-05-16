export interface Project {
    id: number;
    name: string;
}

export interface Filter {
    kind: string;
    pattern: string;
}

export interface Trigger {
    kind: string;
    schedule_param?: ScheduleParam;
}

export interface ScheduleParam {
    type: string;
    weekday?: number;
    offtime: number;
}

export interface PolicyRequest {
    description?: string;
    project_id: number;
    filters?: Filter[];
    replicate_deletion: boolean;
    trigger: Trigger;
}

export interface EdgeRequest {
    src_node_id: string;
    dst_node_id: string;
    policy: PolicyRequest;
}