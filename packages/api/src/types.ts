import FindMyWay from 'find-my-way';
import http from "http";
import http2 from "http2";
import pino, { Logger, LoggerOptions as LOptions } from "pino";
import { JSONSchemaType, Options as AjvOptions } from 'ajv';

export declare type RouteMethods = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export type Server<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = T extends FindMyWay.HTTPVersion.V1
    ? http2.Http2Server
    : http.Server;

export interface TargetRouteDefinition {
    routeDefinition: RouteDefinition;
    target: any;
}

export interface RouteDefinition {
    path?: string;
    method: RouteMethods;
    version?: string;
    middleware?: any[];
    schema?: RouteSchema
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

export interface Type<T> extends Function { new(...args: any[]): T; }


export type ServerResponse<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> =  FindMyWay.Res<T> & {
    send: ResponseSend;
    body: any;
};

type HeaderExtensions = {
    version?: string
};

export type IncomingHeaders<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = T extends FindMyWay.HTTPVersion.V1
    ? http2.IncomingHttpHeaders & HeaderExtensions
    : http.IncomingMessage & HeaderExtensions;

export type Params<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = {
    [key: string]: any
};

export type QueryParams<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = {
    [key: string]: any
};

export type ServerRequest<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = FindMyWay.Req<T> & {
    hostname: string,
    ip: string,
    version: string,
    headers: IncomingHeaders<T>;
    requestId: string | number;
    body: any;
    method: string;
    url: string;
    params: Params<T>;
    query: QueryParams<T>
};

export type RouteHandler<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = (
    req: ServerRequest<T>,
    res: ServerResponse<T>
) => void | Promise<unknown>;

export type RequestHandler<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = (
    req: ServerRequest<T>,
    res: ServerResponse<T>,
    next: (error?: unknown) => void
) => void | Promise<unknown>;

export type ErrorHandler<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = (
    err: Error,
    req: ServerRequest<T>,
    res: ServerResponse<T>,
) => void | Promise<unknown>

export interface AbstractMiddleware<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> {
    run: RequestHandler<T>;
}


export type ServiceOptions<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = {
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


export type LogRequestFunc<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = {
    (req: ServerRequest<T>): any
};

export type LogResponseFunc<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = {
    (req: ServerRequest<T>, res: ServerResponse<T>): any
}

export type VersionHandler<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = (req: ServerRequest<T>) => string;
export type RequestIdHandler<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = (req: ServerRequest<T>) => string | number;
export interface DefaultRoute<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> {
    handleDefaultRoute(
        req: ServerRequest<T>,
        res: ServerResponse<T>,
        next: (error?: unknown) => void
    ): void | Promise<unknown>;
}

export type HandleError<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = {
    handleError(
        err: Error,
        req: ServerRequest<T>,
        res: ServerResponse<T>,
    ): void | Promise<unknown>;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface LambdaDefinition<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> extends Omit<ApplicationDefinition, 'schedulers'> { }

export type ContextDefinition<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = {
    name: string;
    rootPath?: string;
    controllers?: Function[] | FunctionConstructor[];
    middleware?: Function[] | FunctionConstructor[];
    contexts?: Function[] | FunctionConstructor[];
    schedulers?: Function[] | FunctionConstructor[];
}



export interface ApplicationDefinition<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> extends ContextDefinition {
    ignoreTrailingSlash?: boolean;
    allowUnsafeRegex?: boolean;
    caseSensitive?: boolean;
    maxParamLength?: number;
    ajvOptions?: AjvOptions;
    versionHandler?: VersionHandler<T>;
    requestIdHandler?: RequestIdHandler<T>;
    useLogger?: LoggerOptions | LoggerInterface | any;
    logRequests?: boolean;
    logRequestFormat?: LogRequestFunc<T>;
    logResponseFormat?: LogResponseFunc<T>;
    defaultRoute?: Type<DefaultRoute<T>>;
    errorHandler?: Type<HandleError<T>>;
    defaultVersion?: string;
}

export type MiddlewareHandler<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = (req: FindMyWay.Req<T>, res: FindMyWay.Res<T>, next: any) => void;

export interface UseMiddleware {
    (path: string, ...middlewares: MiddlewareHandler[]): void;
    (...middlewares: MiddlewareHandler[]): void;
}

export interface Start {
    (port?: number, hostname?: string): Promise<void>;
    (hostname: string): Promise<void>;
};

export type ServerService<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = {
    logger: Logger;
    lookup: FindMyWay.Handler<T>;
    start: Start;
    stop: () => void;
    routes: () => string;
    get: FindMyWay.ShortHandRoute<T>;
    post: FindMyWay.ShortHandRoute<T>;
    patch: FindMyWay.ShortHandRoute<T>;
    all: FindMyWay.ShortHandRoute<T>;
    connect: FindMyWay.ShortHandRoute<T>;
    head: FindMyWay.ShortHandRoute<T>;
    options: FindMyWay.ShortHandRoute<T>;
    delete: FindMyWay.ShortHandRoute<T>;
    put: FindMyWay.ShortHandRoute<T>;
    use: FindMyWay.ShortHandRoute<T>;
    server: Server<T>
};

export type ClaraServiceType = 
    <T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> (logger: LoggerInterface, applicationDefinitions?: ApplicationDefinition<any> | ServerService<T>, server?: any) => any;


export interface getService<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> {
    (logger: LoggerInterface, applicationDefinition: ApplicationDefinition<T>, server?: Server<T>): ServerService;
    (logger: LoggerInterface, service: ServerService, server?: Server<T> ): ServerService;
}

export type StringResponseStatusCodes = 
    '2xx' | 200 | '3xx' | '4xx' | '5xx';

export {JSONSchemaType} from "ajv";

export interface RouteSchema {
    requestBody?: JSONSchemaType<unknown | any>;
    params?: JSONSchemaType<unknown | any>;
    query?: JSONSchemaType<unknown | any>;
    response?: {
        [statusCode in StringResponseStatusCodes]?: JSONSchemaType<unknown | any>
    }
}

export type SchemaSerializer = (data: unknown) => string;
