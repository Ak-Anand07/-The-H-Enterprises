import type { Application } from '../../declarations';
import { CompanyService } from './companies.class';
export declare const company: (app: Application) => void;
declare module '../../declarations' {
    interface ServiceTypes {
        companies: CompanyService;
    }
}
