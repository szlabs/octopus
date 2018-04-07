import { RegistryKind } from './registry-kind.enum';
import { RegistryStatus } from './registry-status.enum';

export interface RegistryServer {
	ID: string;
	name: string;
	address: string;
	status: RegistryStatus;
	createTime: Date;
	kind: RegistryKind;
}
