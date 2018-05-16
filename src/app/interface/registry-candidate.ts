import { RegistryServer } from './registry-server';

export interface RegistryCandidate {
    added: boolean;
    server: RegistryServer;
}