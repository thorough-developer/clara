import Container from "typedi";
import { ControllerDefinition, Protocol, VersionHandler, RouteDefinition, AbstractMiddleware, ServerResponse, ServerRequest } from '../types';

import { AbstractHelper, HelperParams } from "./abstract-helper";
import { ApplicationRouteHelper } from './application-route-helper';

import restana from 'restana';

const routes: Map<string, Map<string, any[]>> = new Map();

export class ApplicationControllerHelper<T extends Protocol = Protocol.HTTP> extends AbstractHelper<T> {
    routeHelper: ApplicationRouteHelper<T>;

    constructor(helperParams: HelperParams<T>) {
        super(helperParams);

        this.routeHelper = new ApplicationRouteHelper(helperParams);
    }

    loadControllers(rootPath: string) {
        for (const Controller of this.applicationDefinition?.controllers || []) {

            this.logger.info('Loading controller: ', Controller);

            const controller = <any>Container.get(Controller);

            const controllerDefinition: ControllerDefinition = Reflect.getMetadata('controller', Controller);

            const controllerRoute = '/' + (controllerDefinition.basePath || '/');

            const wholePath = (rootPath + controllerRoute).replace(/(\/)\/+/g, "$1");

            this.setControllerLevelMiddleware(wholePath, controller, controllerDefinition);

            const methods = Object.getOwnPropertyNames(controller.constructor.prototype);

            for (const method of methods) {
                const routeMetaData: RouteDefinition = Reflect.getMetadata('route', controller, method);
                if (routeMetaData) {
                    this.routeHelper.addRoute(controller, method, routeMetaData.routeDefinition, wholePath);
                }
            }

        }
    }

    setControllerLevelMiddleware(wholePath: string, controller: any, controllerDefinition: ControllerDefinition) {
        this.initControllerLevelMiddleware(wholePath, controllerDefinition.middleware);
    }

    initControllerLevelMiddleware(path: string, middleWareArray: any = []) {
        for (const Middleware of middleWareArray) {
            if (typeof Middleware === 'function' && Middleware.prototype.run && Middleware.prototype.constructor) {
                const middleware = <AbstractMiddleware<T>>Container.get(<any>Middleware);
                this.service!.use(path, <any>middleware.run.bind(middleware));
            } else {
                this.service!.use(path, <any>Middleware);
            }
        }
    }

    
}