import type { Application } from '../../declarations';
import { UserService } from './users.class';
export declare const user: (app: Application) => void;
declare module '../../declarations' {
    interface ServiceTypes {
        users: UserService;
    }
}
