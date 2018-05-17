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
    id: string;
    src_node_id: string;
    dst_node_id: string;
    policy: PolicyRequest;
}

export interface Job {
    id: number;
    status: string;
    repository: string;
    policy_id: number;
    operation: string;
    tags: string[];
    creation_time: Date;
    update_time: Date;
}

export interface JobStats {
    total: number;
    runningOnes: number;
    failedOnes: number;
    successOnes: number;
}

export interface JobStatsSummary<JobStats> {
    [key: string] : JobStats;
}