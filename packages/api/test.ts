import FindMyWay from 'find-my-way';
import http from "http";
import http2 from "http2";
import pino, { Logger, LoggerOptions as LOptions } from "pino";
const Middie = require('middie/engine');
const reusify = require('reusify');
import Container from "typedi";
import { List } from 'immutable';
import { join as posixJoin  } from "path/posix";
import 'reflect-metadata';


/**
 * Types
 */
/*
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


export type ServerRequest<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = FindMyWay.Req<T> & {
    hostname: string,
    ip: string,
    version: string,
    headers: IncomingHeaders<T>;
    requestId: string | number
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

export type Service<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> = {
    logger: Logger;
    lookup: FindMyWay.Handler<T>;
    start: Start;
    stop: () => void;
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
    <T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> (logger: LoggerInterface, applicationDefinitions?: ApplicationDefinition<any> | Service<T>, server?: any) => any;


export interface getService<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> {
    (logger: LoggerInterface, applicationDefinition: ApplicationDefinition<T>, server?: Server<T>): Service;
    (logger: LoggerInterface, service: Service, server?: Server<T> ): Service;
}

export function getService<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1>(logger: LoggerInterface, applicationDefinition: ApplicationDefinition<T> | Service<T>, server?: Server<T>): any {

    if (isService(applicationDefinition)) {
        return applicationDefinition;
    }

    return ClaraService(logger, <any>applicationDefinition, server );
}

const isService = (service: any) => {
    const props = [
        'logger',
        'lookup',
        'start',
        'stop',
        'get',
        'post',
        'patch',
        'all',
        'connect',
        'head',
        'options',
        'delete',
        'put',
        'use',
        'server'
    ];

    for (const key of props) {
        if (!Object.getOwnPropertyNames(service).includes(key)){
            return false;
        }
    }
    
    return true;
}


export const ClaraVersioning: FindMyWay.ConstraintStrategy<any, string>  = {
    // replace the built in version strategy
    name: 'version',
    // provide a storage factory to store handlers in a simple way
    storage: require('semver-store'),
    deriveConstraint: (req: any) => {
        const acceptHeader: string = req.headers['accept'];
        
        let value =  req.headers['accept-version'] || 
        acceptHeader?.match(/v=\d+/) ||
        acceptHeader?.match(/version=\d+/);

        if (Array.isArray(value)) {
            value = value[0]?.split('=')[1];
        }

        // a hack to allow for 1,2, 3 etc version requests
        if (!Number.isNaN(value)) {
            return `${value}.x`;
        }

        return value;
    },
    validate(value: string) {
        // void
    },
    mustMatchWhenDerived: true // if the request is asking for a version, don't match un-version-constrained handlers
};

export const stepInstance = reusify(StepMiddleware);

function StepMiddleware(this: any) {

    this.errorHandler = null;
    this.middlewares = null;
    this.req = null;
    this.res = null;
    this.index = 0;

    const that: any = this;

    this.run = function(): void {
        const middleware = that.middlewares.get(that.index);

        middleware(that.req, that.res, that.step);
    }

    this.reset =  function(): void {
        that.errorHandler = null;
        that.middlewares = null;
        that.req = null;
        that.res = null;
        that.index = 0;
        stepInstance.release();
    }

    this.step = function(err: any): void {
        if (err) {
            that.errorHandler(err, that.req, that.res);
            that.reset();
            return;
        }

        that.index = that.index + 1;
        
        if (that.index === that.middlewares.length) {
            that.reset();
            return;
        }

        try {
            that.run();
        } catch(e) {
            this.errorHandler(e, that.req, that.res);
            this.reset();
            return;
        }
    }
}

export const ClaraService = <T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> (logger: LoggerInterface, applicationDefinitions: ApplicationDefinition<T>, server?: any) => {

    const middlewareRunner = Middie(function run(err: any, req: any, res: any) {
        if (err) {
            res.end(err);
        }
        return;
    });

    const { defaultRoute, allowUnsafeRegex, caseSensitive, ignoreTrailingSlash, maxParamLength, errorHandler } = applicationDefinitions;

    let boundDefaultRoute: any = (req: any, res: any) => {
        res.end('some type of default response');
    };

    let boundErrorHandler: any = (err: any, req: any, res: any) => {
        res.end('You are doing something wrong here');
    };


    if (defaultRoute) {
        boundDefaultRoute = Container.get(defaultRoute).handleDefaultRoute.bind(defaultRoute);
    }

    if (errorHandler) {
        boundErrorHandler = Container.get(errorHandler).handleError.bind(errorHandler);
    }

    const router = FindMyWay<T>({
        constraints: {
            version: ClaraVersioning
        },
        defaultRoute: boundDefaultRoute,
        allowUnsafeRegex,
        caseSensitive,
        ignoreTrailingSlash,
        maxParamLength
    });

    const on = router.on.bind(router);
    const get = router.on.bind(router, 'GET');
    const post = router.on.bind(router, 'POST');
    const patch = router.on.bind(router, 'PATCH');
    const all = router.on.bind(router, ['GET', 'POST', 'PATCH', 'CONNECT', 'HEAD', 'OPTIONS', 'DELETE', 'PUT']);
    const connect = router.on.bind(router, 'CONNECT');
    const head = router.on.bind(router, 'HEAD');
    const options = router.on.bind(router, 'OPTIONS');
    const del = router.on.bind(router, 'DELETE');
    const put = router.on.bind(router, 'PUT');
    const use = middlewareRunner.use.bind(middlewareRunner);
    
    

    router.lookup = new Proxy<any>(router.lookup, {
        apply(target: any, thisArg: any, argArray: any) {
            try {
                const [req, res, ctx] = argArray;
                const handle = thisArg.find(req.method, req.url, thisArg.constrainer.deriveConstraints(req))
                if (handle === null) return thisArg._defaultRoute(req, res);

                req.params = handle.params;
                const query: any = {};
                req.url.split('?')[1]?.split('&').forEach((queryParam: string) => {
                    const [key, value] = queryParam.split('=');
                    query[key]=value;
                });

                //new URLSearchParams(req.url.split('?')[1]).entries()
                req.query = query;

                middlewareRunner.run(req, res);
                const hasRouteMiddleware = handle.store?.middleware && Array.isArray(handle.store.middleware);

                if (hasRouteMiddleware) {
                    const stepPool = stepInstance.get();
                    stepPool.errorHandler = boundErrorHandler;
                    stepPool.middlewares = handle.store.middleware;
                    stepPool.req = req;
                    stepPool.res = res;
                    stepPool.run();
                }

                if (!res.writableEnded) {
                    handle.handler(req, res, handle.params, handle.store);
                }

            } catch(e) {

            }
        }
    });

    const lookup = router.lookup.bind(router);
    
    let serverInstance: http.Server = server;

    if (!serverInstance) {
        serverInstance = http.createServer();
    }

    const start: Start = (port?: number | string, hostname?: string) => {
        return new Promise<void>((resolve, reject) => {
            serverInstance.on('request', (req: any, res: any) => {
                lookup(req, res);
            });

            const finalPort = typeof port === 'number' ? port : 3000;
            try {
                serverInstance.listen(finalPort, hostname, () => {
                    resolve();
                });
            } catch(e) {
                reject(e);
                process.exit(1);
            }
        });
    };

    const stop = () => {
        process.exit();
    };

    return {
        logger,
        lookup,
        start,
        stop,
        get,
        on,
        routes: (<any>router).routes,
        post,
        patch,
        all,
        connect,
        head,
        options,
        delete: del,
        put,
        use,
        errorHandler: boundErrorHandler,
        defaultRoute: boundDefaultRoute,
        server: serverInstance
    }
}

export function loadContexts(applicationDefinition: ApplicationDefinition, service: Service, rootPath: string) {
    for (const Context of applicationDefinition?.contexts || []) {
        const app: any = Container.get(Context);
        app.init(service, rootPath);
    }
}

export function getMiddlewarePathList(loadedMiddlewares: List<any>, path: string = '/'): List<any>{
    return List.of(path, ...loadedMiddlewares);
}

export function addMiddlwareToService(middlwarePathList: List<any>, service: Service, method: any = 'use') {
    service[method](...middlwarePathList);
}

export function loadMiddlewares(middlewares: any[]): List<any> {
    let list = List<any>();
    for (const Middleware of middlewares ) {
        let func: any;
        if (typeof Middleware === 'function' && Middleware.prototype.run && Middleware.prototype.constructor) {
            const middleware: any = Container.get(<any>Middleware);
            func = <any>middleware.run.bind(middleware);
        } else {
            func = <any>Middleware;
        }
        list = list.push(func);
    }

    return list;
}

export function loadControllers(applicationDefinition: ApplicationDefinition) {
    let controllers: List<any> = List();

    if (applicationDefinition.controllers) {
        for (const Controller of applicationDefinition.controllers) {
            const controller = <any>Container.get(Controller);
    
            const controllerDefinition: ControllerDefinition = Reflect.getMetadata('controller', Controller);
    
            controllers.push({
                path: posixJoin(applicationDefinition.rootPath || '/', controllerDefinition.basePath || '/'),
                controller,
                controllerDefinition
            });
        }
    }

    return controllers;
}

export function getControllerMiddlewarePathList(controllers: List<any>): List<List<any>> {

    let controllersPaths: List<List<any>> = List();

    for (const controller of controllers) {
        if (controller.middleware) {
            const middlewarePathList = List.of(controller.path, ...loadMiddlewares(controller.controllerDefinition.middleware));
            controllersPaths = controllersPaths.push(middlewarePathList);
        }
    }

    return controllersPaths;
}

export function addControllerMiddlewareToService(controllerPathList: List<List<any>>, service: Service) {
    for (const middlewarePathList of controllerPathList) {
        addMiddlwareToService(middlewarePathList, service);
    }
}

export function getRoutesFromController(controllerInformation: any): List<any> {
    let routes = List<any>();
    const {controller} = controllerInformation;
    const methods = Object.getOwnPropertyNames(controller.constructor.prototype);
    
    for (const method of methods) {
        const routeMetaData: RouteDefinition = Reflect.getMetadata('route', controller, method);
        if(routeMetaData) {
            const {routeDefinition} = routeMetaData;
            routes = routes.push({
                routeDefinition,
                handler: controller[method].bind(controller),
                path: posixJoin(controllerInformation.path, routeDefinition.path)
            });
        }
    }
    return routes;
}

export function getRouteMiddleware({routeDefinition}): List<any> {
    let routeMiddleware: List<any> = List();
    
    for (const Middleware of routeDefinition.middleware || []) {
        if (typeof Middleware === 'function' && Middleware.prototype.run && Middleware.prototype.constructor) {
            const middleware = <any>Container.get(Middleware);
            routeMiddleware = routeMiddleware.push(middleware.run.bind(middleware));
        } else {
            routeMiddleware = routeMiddleware.push(Middleware);
        }
    }

    return routeMiddleware;
}

export function addRouteToService(routeMiddleware: List<any>, routeInformation: any, service: Service) {
    const {routeDefinition, handler, path} = routeInformation;

    const routeMethod = routeDefinition.method.toLowerCase();

    if (routeDefinition.version) {
        const meta = {
            constraints: {
                version: routeDefinition.version
            }
        };

        service[routeMethod](path, meta, handler, { middleware: routeMiddleware });

    } else {
        service[routeMethod](path, handler, { middleware: routeMiddleware });
    }
}

const service = getService(<any>{}, applicationDefinition);

addMiddlwareToService(
    getMiddlewarePathList(
        loadMiddlewares(applicationDefinition.middleware),
        applicationDefinition.rootPath
    ),
    service
);

const controllers = loadControllers(applicationDefinition);

addControllerMiddlewareToService(
    getControllerMiddlewarePathList(controllers),
    service
);

controllers.forEach((controller) => {
    const routes = getRoutesFromController(controller);

    routes.forEach((routeInformation) => {
        addRouteToService(
            getRouteMiddleware(routeInformation),
            routeInformation,
            service
        );
    });
    routes.clear();
});

controllers.clear();

*/