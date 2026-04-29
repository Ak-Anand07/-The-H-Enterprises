import { HookContext as FeathersHookContext, NextFunction } from '@feathersjs/feathers';
import { Application as FeathersApplication } from '@feathersjs/koa';
import { ApplicationConfiguration } from './configuration';
import { healthService } from './services/health.service';
export type { NextFunction };
export interface Configuration extends ApplicationConfiguration {
}
export interface ServiceTypes {
    health: typeof healthService;
}
export type Application = FeathersApplication<ServiceTypes, Configuration>;
export type HookContext<S = any> = FeathersHookContext<Application, S>;
