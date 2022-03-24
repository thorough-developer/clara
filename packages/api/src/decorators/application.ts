import claraService = require('restana');
import { getLogger } from '../utils/logger';
import {  ApplicationDefinition,ContextDefinition } from '../types';
import { LoggerHelper } from '../helpers/static/logger-helper';
import { Service as DecoratorService } from 'typedi';
import { mergeApplicationDefaults } from '../utils/application-defaults';
import { addControllerMiddlewareToService, addMiddlwareToService, addRouteToService, getControllerMiddlewarePathList, getMiddlewarePathList, getRouteMiddleware, getRoutesFromController, getService, loadContexts, loadControllers, loadMiddlewares } from '../utils';
import { posix } from 'path';

export function appSetup(userDefinedApplicationDefinition: ApplicationDefinition | ContextDefinition) {

    const applicationDefinition = mergeApplicationDefaults(userDefinedApplicationDefinition);

    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        class app extends constructor {
            
            init(service?: any, rootPath?: string) {
                
                const logger = <any>getLogger();

                const contextRootPath = posix.join(rootPath || '/', applicationDefinition.rootPath);

                const myService = service ? 
                    service:
                    getService(logger, applicationDefinition);

                
                addMiddlwareToService(
                    getMiddlewarePathList(
                        loadMiddlewares(applicationDefinition.middleware),
                        contextRootPath
                    ),
                    myService
                );

                const controllers = loadControllers(applicationDefinition, contextRootPath);

                addControllerMiddlewareToService(
                    getControllerMiddlewarePathList(controllers),
                    myService
                );

                controllers.forEach((controller) => {
                    const routes = getRoutesFromController(controller);

                    routes.forEach((routeInformation) => {
                        addRouteToService(
                            getRouteMiddleware(routeInformation),
                            routeInformation,
                            myService
                        );
                    });

                    routes.clear();
                });

                controllers.clear();

                loadContexts(applicationDefinition, myService, contextRootPath);

                
                return myService;
                
            }
            
        }
        DecoratorService()(app);
        return app;
    }
}

export function Context (contextDefinition: ContextDefinition) {
    return appSetup(contextDefinition);
}

export function Application(applicationDefinition: ApplicationDefinition) {
    
    // needs to happen because an Application can get an injected logger
    LoggerHelper.setupLogger(applicationDefinition);
    
    return appSetup(applicationDefinition);
};