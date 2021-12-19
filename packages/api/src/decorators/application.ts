import claraService = require('restana');
import {  Service } from '.';
import { getLogger } from '../utils/logger';
import { ApplicationDefinition,ContextDefinition, Server, ServiceOptions, Protocol, HandleError, DefaultRoute } from '../types';
import { ApplicationClaraMiddlewareHelper } from '../helpers/application-clara-middleware-helper';
import { ApplicationRouteInterceptorHelper } from '../helpers/application-route-interceptor-handler';
import { ApplicationResourceLoaderHelper } from '../helpers/resource-loader-helper';
import { LoggerHelper } from '../helpers/static/logger-helper';
import Container from 'typedi';
import { mergeApplicationDefaults } from '../utils/application-defaults';

export function isValidService(service: any) {
    let result = true;

    
    const methods = [
        'getRouter',
        'newRouter',
        'errorHandler',
        'getServer',
        'getConfigOptions',
        'use',
        'handle',
        'start',
        'close'
    ];

    for (let i = 0; i < methods.length; i += 1) {
        if (!service[methods[i]] || typeof service[methods[i]] !== 'function') {
            result = false;
            break;
        }
    }
    return result;
}


export function appSetup<P extends Protocol = Protocol.HTTP>(userDefinedApplicationDefinition: ApplicationDefinition<P> | ContextDefinition<P>) {

    const applicationDefinition = mergeApplicationDefaults<P>(userDefinedApplicationDefinition);

    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        class app extends constructor {
            service!: claraService.Service<P>;
            applicationResourceLoaderHelper!: ApplicationResourceLoaderHelper<P>;
            applicationClaraMiddlewareHelper!: ApplicationClaraMiddlewareHelper<any>;
            applicationRouteInterceptorHelper!: ApplicationRouteInterceptorHelper<any>;

            init(serverOptions: any, rootPath?: string) {
                
                const path = <any>rootPath || '/';
                const finalRootPath = (path + applicationDefinition.rootPath || '/').replace(/(\/)\/+/g, "$1");

                let isContext = true;

                let service;
                if (isValidService(serverOptions)) {
                    service = serverOptions;
                } else {
                    service = this.createService(serverOptions);

                    isContext = false;
                }

                this.applicationResourceLoaderHelper = this.getApplicationResourceLoaderHelper(service); 
                this.applicationClaraMiddlewareHelper = this.getApplicationClaraMiddlewareHelper(service);
                this.applicationRouteInterceptorHelper = this.getApplicationRouteInterceptorHelper(service);

                if (!isContext) {
                    this.loadClaraMiddlewareHelper(service);

                    this.activateRouteInterceptor(service);
                }


                this.loadResources(service, finalRootPath);

                this.loadContexts(service, finalRootPath);

                return service;
                
            }
            
            createService(serverOptions: ServiceOptions<P>): any {
                const defaultRoute = applicationDefinition!.defaultRoute;
                const errorHandler = applicationDefinition!.errorHandler;
                const routerCacheSize = serverOptions?.routerCacheSize;
                const prioRequestsProcessing= serverOptions?.prioRequestsProcessing;
                const server = serverOptions?.server;

                const impelementedErrorHandler = <HandleError<P>>Container.get(errorHandler);
                const implementedDefaultRoute = <DefaultRoute<P>>Container.get(defaultRoute);

                const service = <any> claraService({
                        routerCacheSize,
                        server,
                        prioRequestsProcessing,
                        errorHandler: <any>impelementedErrorHandler.handleError.bind(impelementedErrorHandler),
                        defaultRoute: <any>implementedDefaultRoute.handleDefaultRoute.bind(implementedDefaultRoute)
                    });
                return service;
            }

            loadContexts(service: claraService.Service<P>, rootPath: string) {
                for (const Context of applicationDefinition?.contexts || []) {
                    const app: any = Container.get(Context);
                    app.init(service, rootPath);
                }
            }

            loadResources(service: claraService.Service<P>, rootPath: string){
                this.applicationResourceLoaderHelper.loadResources(rootPath);
            }

            loadClaraMiddlewareHelper(service: claraService.Service<P>) {
                this.applicationClaraMiddlewareHelper.initMiddleware();
            }

            activateRouteInterceptor(service: claraService.Service<P>){
                this.applicationRouteInterceptorHelper.interceptLookup();
            }

            getApplicationClaraMiddlewareHelper(service: claraService.Service<P>): ApplicationClaraMiddlewareHelper<any> {
                return new ApplicationClaraMiddlewareHelper<P>({
                    service,
                    logger: <any>getLogger()
                });
            }

            getApplicationRouteInterceptorHelper(service: claraService.Service<P>): ApplicationRouteInterceptorHelper<any> {
                return new ApplicationRouteInterceptorHelper<P>({
                    service,
                    logger: <any>getLogger(),
                    applicationDefinition: <any>applicationDefinition
                });
            }

            getApplicationResourceLoaderHelper(service: claraService.Service<P>) {
                return new ApplicationResourceLoaderHelper<P>({
                    service,
                    logger: <any>getLogger(),
                    applicationDefinition: <any>applicationDefinition
                });
            }
        }
        Service()(app);
        return app;
    }
}

export function Context<P extends Protocol = Protocol.HTTP> (contextDefinition: ContextDefinition) {
    return appSetup(contextDefinition);
}
export function Application<P extends Protocol = Protocol.HTTP>(applicationDefinition: ApplicationDefinition<P>) {
    
    // needs to happen because an Application can get an injected logger
    LoggerHelper.setupLogger(applicationDefinition);
    
    return appSetup(applicationDefinition);
};