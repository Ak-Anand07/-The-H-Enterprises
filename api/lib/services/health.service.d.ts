import type { Params } from '@feathersjs/feathers';
declare class HealthService {
    get(_id: null, _params?: Params): Promise<{
        status: string;
        service: string;
        timestamp: string;
    }>;
}
export declare const healthService: HealthService;
export {};
