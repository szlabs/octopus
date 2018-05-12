import { RegistryKind } from './registry-kind.enum';
import { RegistryStatus } from './registry-status.enum';

export interface RegistryServer {
	id?: string;
	name: string;
	url: string;
	username?: string;
	password?: string;
	status: RegistryStatus;
	create_time?: Date;
	update_time?: Date;
	kind: RegistryKind;
	insecure: boolean;
}
