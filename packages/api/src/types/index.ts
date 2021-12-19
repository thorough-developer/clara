import http from "http";
import http2, { Http2SecureServer, Http2ServerResponse } from "http2";
import * as restana from "restana";
import {Token} from 'typedi';
import pino, { LoggerOptions as LOptions } from "pino";
import { InterfaceDeclaration, InterfaceType } from "typescript";

export declare type RouteMethods = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export interface TargetRouteDefinition {
    routeDefinition: RouteDefinition;
    target: any;
}

export interface RouteDefinition {
    path?: string;
    method: RouteMethods;
    version?: string;
    middleware?: any[];
    routeDefinition?: RouteDefinition;
}
export interface ControllerDefinition {
    basePath: string;
    middleware?: any[];
}
export interface ControllerType {
    controllerDefinition: ControllerDefinition;
    controller: any;
}


export interface LocalSessionContext {
    get(key: string): any;
    set(key: string, value: any): void;
}

export interface AfterResourcesLoaded {
    afterResourcesLoaded(): void;
}

export interface LoggerInterface {
    child(bindings: pino.Bindings, options?: pino.ChildLoggerOptions): pino.Logger | undefined;

    fatal: pino.LogFn;

    error: pino.LogFn;

    warn: pino.LogFn;

    info: pino.LogFn;

    debug: pino.LogFn;

    trace: pino.LogFn;

    silent: pino.LogFn;
};

export interface LoggerOptions extends LOptions { };

export interface Type<T> extends Function { new (...args: any[]): T; }

export enum Protocol {
    HTTP = 'http',
    HTTPS = 'https',
    HTTP2 = 'http2'
  };

declare type Class<T extends InterfaceType = any> = new (...args: any[]) => T;

export type ClaraService<T extends Protocol = Protocol.HTTP> = {
    errorHandler: any;
    defaultRoute: any;
} & restana.Service<T>;

export type ServerResponse<T extends Protocol = Protocol.HTTP> = restana.Response<T> & {
  body: any
};

type HeaderExtensions = {
  version?: string
};

export type IncomingHeaders<T extends Protocol = Protocol.HTTP>  = T extends Protocol.HTTP2
    ? http2.IncomingHttpHeaders & HeaderExtensions
    : http.IncomingMessage & HeaderExtensions;


export type ServerRequest<T extends Protocol = Protocol.HTTP> = restana.Request<T> & {
  hostname: string,
  ip: string,
  version: string,
  headers: IncomingHeaders<T>;
  requestId: string | number
};

export type Server<T extends Protocol = Protocol.HTTP> = restana.Server<T>;

export type RouteHandler<T extends Protocol = Protocol.HTTP> = (
    req: ServerRequest<T>,
    res: ServerResponse<T>
)=> void | Promise<unknown>;

export type RequestHandler<T extends Protocol  = Protocol.HTTP> = (
    req: ServerRequest<T>,
    res: ServerResponse<T>,
    next: (error?: unknown) => void
  ) => void | Promise<unknown>;

export type ErrorHandler<T extends Protocol  = Protocol.HTTP> =  (
    err: Error,
    req: ServerRequest<T>,
    res: ServerResponse<T>,
  ) => void | Promise<unknown>

export interface AbstractMiddleware<T extends Protocol  = Protocol.HTTP> {
    run: RequestHandler<T>;
}

export interface App<T extends Protocol = Protocol.HTTP> extends restana.Service<T> {};

export type ServiceOptions<T extends Protocol = Protocol.HTTP> = {
    prioRequestsProcessing?: boolean;
    routerCacheSize?: number;
    server?: Server<T>;
}

export type ResponseSend = (
  data?: unknown,
  code?: number,
  headers?: Record<string, number | string | string[]>,
  cb?: () => void
) => void;


export type LogRequestFunc<T extends Protocol = Protocol.HTTP> = {
    (req: ServerRequest<T>): any
};

export type LogResponseFunc<T extends Protocol = Protocol.HTTP> = {
    (req: ServerRequest<T>, res: ServerResponse<T>): any
}

export type VersionHandler<T extends Protocol = Protocol.HTTP> = (req: ServerRequest<T>) => string;
export type RequestIdHandler <T extends Protocol = Protocol.HTTP>= (req: ServerRequest<T>) => string | number;
export interface DefaultRoute<T extends Protocol  = Protocol.HTTP> {
    handleDefaultRoute(
        req: ServerRequest<T>,
        res: ServerResponse<T>,
        next: (error?: unknown) => void
      ): void | Promise<unknown>;
}

export type HandleError<T extends Protocol  = Protocol.HTTP> =  {
    handleError(
        err: Error,
        req: ServerRequest<T>,
        res: ServerResponse<T>,
      ): void | Promise<unknown>;
}
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface LambdaDefinition<T extends Protocol = Protocol.HTTP> extends Omit<ApplicationDefinition, 'schedulers'> {}

export type ContextDefinition<T extends Protocol = Protocol.HTTP> = {
    name: string;
    rootPath?: string;
    controllers?: Function[] | FunctionConstructor[];
    middleware?: Function[] | FunctionConstructor[];
    contexts?: Function[] | FunctionConstructor[];
    schedulers?: Function[] | FunctionConstructor[];
}

export interface ApplicationDefinition<T extends Protocol = Protocol.HTTP> extends ContextDefinition {
    versionHandler?: VersionHandler<T>;
    requestIdHandler?: RequestIdHandler<T>;
    useLogger?: LoggerOptions | LoggerInterface | any;
    logRequests?: boolean;
    logRequestFormat?: LogRequestFunc<T>;
    logResponseFormat?: LogResponseFunc<T>;
    defaultRoute?: Type<DefaultRoute<T>>;
    errorHandler?: Type<HandleError<T>>;
}


export const APP_DEF_TOKEN = new Token<ApplicationDefinition>();
export const SERVER_DEF_TOKEN = new Token<ServiceOptions>();
export const SERVICE_TOKEN = new Token<ServiceOptions>();