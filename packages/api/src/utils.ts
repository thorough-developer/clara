import FindMyWay from 'find-my-way';
import http from "http";
const Middie = require('middie/engine');
const reusify = require('reusify');
import { Container } from "typedi";
import { List, Map as IMap } from 'immutable';
import { posix } from "path";
import 'reflect-metadata';
import { SchemaSerializer, StringResponseStatusCodes, TargetRouteDefinition, ServerService, ServerRequest, ServerResponse, Server, Start, ApplicationDefinition, ControllerDefinition, LoggerInterface, RouteDefinition } from './types';
import { asyncLocalStorage } from './utils/async-local-storage';
import { getLogger } from './utils/logger';
import Ajv from 'ajv';
import { URLSearchParams } from 'url';
const FastJson = require('fast-json');

let ajv: any;

const flatstr = require('flatstr');
const fastJson = require('fast-json-stringify');


const CONTENT_TYPE_HEADER = 'content-type'
const TYPE_JSON = 'application/json; charset=utf-8'
const TYPE_PLAIN = 'text/plain; charset=utf-8'
const TYPE_OCTET = 'application/octet-stream'

const NOOP = () => { }

/** Stolen from Restana but with some optimizations */
/*
const beforeEnd = (res: ServerResponse, contentType: string, statusCode: number) => {
    if (contentType) {
        res.setHeader(CONTENT_TYPE_HEADER, contentType)
    }
    res.statusCode = statusCode;
}
*/
const errorStringify = fastJson({
    type: 'object',
    properties: {
        code: {
            type: 'integer'
        },
        message: {
            type: 'string'
        },
        data: {
            type: 'object'
        }
    }
});

/*
const parseErr = (error: any) => {
    const errorCode = error.status || error.code || error.statusCode
    const statusCode = typeof errorCode === 'number' ? errorCode : 500;
    return {
        statusCode,
        data: flatstr(errorStringify({
            code: statusCode,
            message: error.message,
            data: error.data
        }))
    }
};
*/
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
        if (!Object.getOwnPropertyNames(service).includes(key)) {
            return false;
        }
    }

    return true;
}

export interface getService<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1> {
    (logger: LoggerInterface, applicationDefinition: ApplicationDefinition<T>, server?: Server<T>): ServerService;
    (logger: LoggerInterface, service: ServerService, server?: Server<T>): ServerService;
}

export function getService<T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1>(logger: LoggerInterface, applicationDefinition: ApplicationDefinition<T> | ServerService<T>, server?: Server<T>): any {

    if (isService(applicationDefinition)) {
        return applicationDefinition;
    }

    return ClaraService(logger, <any>applicationDefinition, server);
}

export const ClaraVersioning: FindMyWay.ConstraintStrategy<any, string> = {
    // replace the built in version strategy
    name: 'version',
    // provide a storage factory to store handlers in a simple way
    storage: require('semver-store'),
    deriveConstraint: (req: any) => {
        const acceptHeader: string = req.headers['accept'];

        let value = req.headers['accept-version'] ||
            acceptHeader?.match(/v=\d+/) ||
            acceptHeader?.match(/version=\d+/);

        if (Array.isArray(value)) {
            value = value[0]?.split('=')[1];
        }

        // a hack to allow for 1,2, 3 etc version requests
        if (!Number.isNaN(value) && value != null) {
            return flatstr(value + '.x');
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

    this.run = function (): void {
        const middleware = that.middlewares.get(that.index);

        middleware(that.req, that.res, that.step);
    }

    this.reset = function (): void {
        that.errorHandler = null;
        that.middlewares = null;
        that.req = null;
        that.res = null;
        that.index = 0;
        stepInstance.release();
    }

    this.step = function (err: any): void {
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
        } catch (e) {
            this.errorHandler(e, that.req, that.res);
            this.reset();
            return;
        }
    }
}

let ajvInstance: Ajv;

export const ClaraService = <T extends FindMyWay.HTTPVersion = FindMyWay.HTTPVersion.V1>(logger: LoggerInterface, applicationDefinition: ApplicationDefinition<T>, server?: any) => {

    ajv = applicationDefinition.ajvOptions;
    ajvInstance = new Ajv(ajv);

    const { defaultRoute, allowUnsafeRegex, caseSensitive, ignoreTrailingSlash, maxParamLength, errorHandler } = applicationDefinition;

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

    const middlewareRunner = Middie(function (err: any, req: any, res: any) {
        if (err) {
            return boundErrorHandler(err, req, res);
        }

        return;
    });

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

    // const routeCache = new LRU(1000);
    const sendInstance = reusify(Send);

    const {parse} = JSON;

    router.lookup = new Proxy<any>(router.lookup, {
        apply(target: any, thisArg: any, argArray: [ req: ServerRequest, res: ServerResponse, ctx: any ]) {

            asyncLocalStorage.run(new Map(Object.entries({})), async () => {
                const [req, res] = argArray;
                const derivedConstraints = thisArg.constrainer.deriveConstraints(req);

                applicationDefinition.requestIdHandler!(<any>req);

                handleLogRequests(req, res);

                const handle = thisArg.find(req.method, req.url, derivedConstraints);
                
                const contentType = req.headers['content-type'] || null;
            
                const send = sendInstance.get();
                send.req = req;
                send.res = res;
                send.routeStore = handle?.store;

                res.send = send.send;

                if (handle === null) return thisArg._defaultRoute(req, res);
                
                // let buffers: List<Uint8Array> = List();
                let buffers: string = '';
                
                for await (const chunk of req) {
                    //buffers = buffers.push(chunk);
                    buffers = buffers + chunk;
                }

                // if (buffers.size > 0) {
                if (buffers) {
                    // const bufferString = Buffer.concat(buffers.toArray()).toString();
                    buffers = flatstr(buffers);
                    switch (contentType) {
                        case null:
                        case 'application/json':
                            req.body = parse(buffers);
                            break;
                        case 'application/x-www-form-urlencoded':
                            req.body = Object.fromEntries(new URLSearchParams(buffers).entries());
                            break;
                    }
                }

                

                req.params = handle.params;
                
                const queryString = req.url.split('?')[1];

                if (queryString) {
                    const querySet = new URLSearchParams(queryString);
                    req.query = Object.fromEntries(querySet.entries());
                } else {
                    req.query = {};
                }
                
                try {
                    middlewareRunner.run(req, res);
                    const hasRouteMiddleware = handle.store?.middleware && Array.isArray(handle.store.middleware);

                    if (hasRouteMiddleware) {
                        const stepPool = stepInstance.get();
                        stepPool.errorHandler = boundErrorHandler;
                        // copy array here
                        stepPool.middlewares = handle.store.middleware;
                        stepPool.req = req;
                        stepPool.res = res;
                        stepPool.run();
                    }


                    if (!res.writableEnded) {
                        handle.handler(req, res, handle.params, handle.store);
                    }

                } catch (e) {
                    boundErrorHandler(e, req, res);
                }
            });

        }
    });

    const lookup = router.lookup.bind(router);

    let serverInstance: http.Server = server;

    if (!serverInstance) {
        serverInstance = http.createServer();
    }

    const handleLogRequests = (req: any, res: any) => {
        if (applicationDefinition.logRequests) {
            const start = process.hrtime();

            getLogger()!.info((<any>applicationDefinition).logRequestFormat(req));

            res.on('finish', () => {

                const stop = process.hrtime(start);
                const duration = flatstr('' + ((stop[0] * 1e9 + stop[1]) / 1e9) * 1000 + 'ms');
                getLogger()!.info({ ...(<any>applicationDefinition).logResponseFormat(req, res), ...{ duration } });
            }
            );
        }
    };

    const fastJson = new FastJson();

    const start: Start = (port?: number | string, hostname?: string) => {
        return new Promise<void>((resolve, reject) => {

            serverInstance.on('request', async (req: any, res: ServerResponse) => {
                lookup(req, <any>res);
            });

            const finalPort = typeof port === 'number' ? port : 3000;
            try {
                serverInstance.listen(finalPort, hostname, () => {
                    resolve();
                });
            } catch (e) {
                reject(e);
                process.exit(1);
            }
        });
    };

    const stop = () => {
        process.exit();
    };

    function Send(this: any) {
        this.req = null;
        this.res = null;
        this.routeStore = null;

        const that = this;

        this.beforeEnd = function (res: ServerResponse, contentType: string, statusCode: number) {
            if (contentType) {
                res.setHeader(CONTENT_TYPE_HEADER, contentType)
            }
            res.statusCode = statusCode;
        }

        that.parseErr = function (error: any) {
            const errorCode = error.status || error.code || error.statusCode
            const statusCode = typeof errorCode === 'number' ? errorCode : 500;
            return {
                statusCode,
                data: flatstr(errorStringify({
                    code: statusCode,
                    message: error.message,
                    data: error.data
                }))
            }
        };

        this.send = function (data: number | Error | any = that.res.statusCode, code: number = that.res.statusCode, headers: any = null, cb = NOOP) {
            const schemaSerializers: IMap<string | number, SchemaSerializer> = that.routeStore?.schema?.get('response');

            let contentType;

            if (data instanceof Error) {
                const err = that.parseErr(data);
                contentType = TYPE_JSON;
                code = err.statusCode;
                data = err.data;
            } else {
                if (headers && typeof headers === 'object') {
                    Object.entries(headers).forEach(([key, value]) => {
                        that.res.setHeader(key.toLowerCase(), <any>value);
                    });
                }

                // NOTE: only retrieve content-type after setting custom headers
                contentType = that.res.getHeader(CONTENT_TYPE_HEADER);

                if (typeof data === 'number') {
                    code = data
                    data = that.res.body
                }

                if (data) {
                    if (typeof data === 'string') {
                        if (!contentType) contentType = TYPE_PLAIN
                    } else if (typeof data === 'object') {
                        if (data instanceof Buffer) {
                            if (!contentType) contentType = TYPE_OCTET;
                        } else if (typeof data.pipe === 'function') {
                            if (!contentType) contentType = TYPE_OCTET;

                            // NOTE: we exceptionally handle the response termination for streams
                            that.beforeEnd(that.res, <string>contentType, code);

                            data.pipe(that.res);
                            data.on('end', cb);

                            return;
                        } else if (Promise.resolve(data) === data) { // http://www.ecma-international.org/ecma-262/6.0/#sec-promise.resolve
                            headers = null
                            return data
                                .then((resolved: Function) => that.send(resolved, code, headers, cb))
                                .catch((err: any) => that.send(err, code, headers, cb))
                        } else {

                            if (!contentType) contentType = TYPE_JSON;

                            const genericStatus: StringResponseStatusCodes = <StringResponseStatusCodes>flatstr(('' + code)[0] + 'xx');

                            // data = flatstr(JSON.stringify(data));
                            let stringify = that.routeStore.stringify?.get(code);


                            if (!stringify) {
                                if (!that.routeStore.stringify) {
                                    that.routeStore.stringify = IMap();
                                }
                                stringify = schemaSerializers.get(genericStatus, schemaSerializers.get(code, JSON.stringify));

                                that.routeStore.stringify = that.routeStore.stringify.set(code, stringify);
                            }

                            data = flatstr(stringify(data));

                        }
                    }
                }
            }

            that.beforeEnd(that.res, <string>contentType, code);
            that.res.end(data, cb);
            that.res = null;
            that.req = null;
            that.routeStore = null;
            sendInstance.release();
        }

    };
    /*
    const send = (req: ServerRequest, res: ServerResponse, routeStore: any  ) => {
        const schemaSerializers: IMap<string | number, SchemaSerializer> = routeStore?.schema?.get('response');

        const innerSend = (data: number | Error | any = res.statusCode, code: number = res.statusCode, headers: any = null, cb = NOOP) => {
            let contentType;

            if (data instanceof Error) {
                const err = parseErr(data);
                contentType = TYPE_JSON;
                code = err.statusCode;
                data = err.data;
            } else {
                if (headers && typeof headers === 'object') {
                    Object.entries(headers).forEach(([key, value]) => {
                        res.setHeader(key.toLowerCase(), <any>value);
                    });
                }

                // NOTE: only retrieve content-type after setting custom headers
                contentType = res.getHeader(CONTENT_TYPE_HEADER);

                if (typeof data === 'number') {
                    code = data
                    data = res.body
                }

                if (data) {
                    if (typeof data === 'string') {
                        if (!contentType) contentType = TYPE_PLAIN
                    } else if (typeof data === 'object') {
                        if (data instanceof Buffer) {
                            if (!contentType) contentType = TYPE_OCTET;
                        } else if (typeof data.pipe === 'function') {
                            if (!contentType) contentType = TYPE_OCTET;

                            // NOTE: we exceptionally handle the response termination for streams
                            beforeEnd(res, <string>contentType, code);

                            data.pipe(res);
                            data.on('end', cb);

                            return;
                        } else if (Promise.resolve(data) === data) { // http://www.ecma-international.org/ecma-262/6.0/#sec-promise.resolve
                            headers = null
                            return data
                                .then((resolved: Function) => innerSend(resolved, code, headers, cb))
                                .catch((err: any) => innerSend(err, code, headers, cb))
                        } else {

                            if (!contentType) contentType = TYPE_JSON;

                            const genericStatus: StringResponseStatusCodes = <StringResponseStatusCodes>flatstr((''+ code)[0] + 'xx');
                            
                            // data = flatstr(JSON.stringify(data));
                            let stringify = routeStore.stringify?.get(code);
                            

                            if (!stringify) {
                                if (!routeStore.stringify) {
                                    routeStore.stringify = IMap();
                                }
                                stringify = schemaSerializers.get(genericStatus, schemaSerializers.get(code, JSON.stringify));

                                routeStore.stringify = routeStore.stringify.set(code, stringify);
                            }
                            
                            data = flatstr(stringify(data));
                            
                        }
                    }
                }
            }

            beforeEnd(res, <string>contentType, code);
            res.end(data, cb);
        };

        return innerSend;
    }
    */

    return {
        logger,
        lookup,
        start,
        stop,
        get,
        on,
        routes: () => router.prettyPrint(),
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

export const loadContexts = (applicationDefinition: ApplicationDefinition, service: ServerService, rootPath: string) => {
    for (const Context of applicationDefinition?.contexts || []) {
        const app: any = Container.get(Context);
        app.init(service, rootPath);
    }
}

export function getMiddlewarePathList(loadedMiddlewares: List<any>, path: string = '/'): List<any> {
    return loadedMiddlewares.isEmpty() ? List() : List.of(path, ...loadedMiddlewares);
}

export function addMiddlwareToService(middlwarePathList: List<any>, service: ServerService, method: any = 'use') {
    if (!middlwarePathList.isEmpty()) {
        const path = middlwarePathList.get(0);
        const middleware = middlwarePathList.remove(0);
        (<any>service)[method](path, middleware.toArray());
    }
}

export function loadMiddlewares(middlewares: any[] = []): List<any> {
    let list = List<any>();
    for (const Middleware of middlewares) {
        let func: any;
        if (typeof Middleware === 'function' && Middleware.prototype?.run && Middleware.prototype?.constructor) {
            const middleware: any = Container.get(<any>Middleware);
            func = <any>middleware.run.bind(middleware);
            func({ headers: { 'user-id': 'cwashington' } }, undefined, () => { });
        } else {
            func = <any>Middleware;
        }
        list = list.push(func);
    }

    return list;
}

export function loadControllers(applicationDefinition: ApplicationDefinition, path: string) {
    let controllers: List<any> = List();

    if (applicationDefinition.controllers) {
        for (const Controller of applicationDefinition.controllers || []) {
            const controller = <any>Container.get(Controller);

            const controllerDefinition: ControllerDefinition = Reflect.getMetadata('controller', Controller);

            controllers = controllers.push({
                path: posix.join(path || '/', controllerDefinition.basePath || '/'),
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

export function addControllerMiddlewareToService(controllerPathList: List<List<any>>, service: ServerService) {
    for (const middlewarePathList of controllerPathList) {
        addMiddlwareToService(middlewarePathList, service);
    }
}

export function getRoutesFromController(controllerInformation: any): List<any> {
    let routes = List<any>();
    const { controller } = controllerInformation;
    const methods = Object.getOwnPropertyNames(controller.constructor.prototype);

    for (const method of methods) {
        const routeMetaData: TargetRouteDefinition = Reflect.getMetadata('route', controller, method);
        if (routeMetaData) {
            const routeDefinition = routeMetaData!.routeDefinition;
            routes = routes.push({
                routeDefinition,
                handler: controller[method].bind(controller),
                path: posix.join(controllerInformation.path, <string>routeDefinition!.path)
            });
        }
    }
    return routes;
}

export function getRouteMiddleware(routeInformation: any): List<any> {
    const { routeDefinition } = routeInformation;
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

export function addRouteToService(routeMiddleware: List<any>, routeInformation: any, service: ServerService) {
    const { routeDefinition, handler, path } = routeInformation;

    const routeMethod = routeDefinition.method.toLowerCase();

    let schemaDef: IMap<string, SchemaSerializer | IMap<(string | number), SchemaSerializer>> = IMap();

    if (routeDefinition.schema) {
        Object.keys(routeDefinition.schema)
            .forEach((key) => {
                if (key === 'response') {
                    let responseMap: IMap<(string | number), SchemaSerializer> = IMap();

                    Object.keys(routeDefinition.schema[key]).forEach((responseKey) => {
                        responseMap = responseMap.set(responseKey, fastJson(routeDefinition.schema[key][responseKey], { ajv }));
                    });

                    schemaDef = schemaDef.set(key, responseMap);
                } else if (key === 'requestBody') {

                }
            })
    }

    if (routeDefinition.version) {
        const places = 2 - (routeDefinition.version.split('.').length - 1);

        const version = places === 0 ? routeDefinition.version :
            routeDefinition.version.padEnd(routeDefinition.version.length + places * 2, '.0');

        const meta = {
            constraints: {
                version
            }
        };



        (<any>service)[routeMethod](path, meta, handler, { middleware: routeMiddleware, schema: schemaDef });

    } else {
        (<any>service)[routeMethod](path, handler, { middleware: routeMiddleware, schema: schemaDef });
    }
}