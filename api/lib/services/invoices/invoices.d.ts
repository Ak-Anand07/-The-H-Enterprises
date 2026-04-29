import type { Application } from '../../declarations';
import { InvoiceService } from './invoices.class';
export declare const invoice: (app: Application) => void;
declare module '../../declarations' {
    interface ServiceTypes {
        invoices: InvoiceService;
    }
}
