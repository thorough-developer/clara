import Container from "typedi";
import { ControllerDefinition, VersionHandler, RouteDefinition, AbstractMiddleware, ServerResponse, ServerRequest } from '../types';
import { Protocol } from "../types";
import { AbstractHelper, HelperParams } from "./abstract-helper";
import restana from 'restana';
import { versionRouteNext } from "../utils/next";

const routes: Map<string, Map<string, any[]>> = new Map();

export class ApplicationRouteHelper<T extends Protocol = Protocol.HTTP> extends AbstractHelper<T> {

    addRoute(controller: any, func: string, routeDefinition: RouteDefinition | any, path: string) {

        const routePath = '/' + (routeDefinition.path || '/');

        const wholePath = (path + routePath).replace(/(\/)\/+/g, "$1");

        const routeMiddleware = [];

        for (const Middleware of routeDefinition.middleware || []) {
            if (typeof Middleware === 'function' && Middleware.prototype.run && Middleware.prototype.constructor) {
                const middleware: AbstractMiddleware<T> = <AbstractMiddleware<T>>Container.get(<any>Middleware);
                routeMiddleware.push(middleware.run.bind(middleware));
            } else {
                routeMiddleware.push(Middleware);
            }
        }
        routeMiddleware.push(controller[func].bind(controller));

        this.constructRoute(this.service, routeDefinition, wholePath, routeMiddleware);

    }

    constructRoute(service: any, routeDefinition: RouteDefinition, path: string, routeMiddleware: any[]) {
        const version = routeDefinition.version || 'default';

        let currentRoute: Map<string, any[]> | undefined;

        if (routes.has(path)) {
            currentRoute = routes.get(path);
        } else {
            currentRoute = new Map<string, any[]>();
            routes.set(path, currentRoute);
        }

        currentRoute!.set(version, routeMiddleware);

        service[routeDefinition.method.toLowerCase()](path, this.getUseHandler().bind(this));
    }

    getMiddlewares(version: string, req: ServerRequest<T>) {
        const url = req.url || '/';

        const pathRoutes = routes.get(url);
        const middlewares = pathRoutes!.get(version);

        return middlewares;
    }

    getUseHandler() {
        return async (req: ServerRequest<T>, res: ServerResponse<T>, next: any) => {
            try {
                const version = this.applicationDefinition!.versionHandler!(req);

                const middlewares = this.getMiddlewares(version, req) || [];

                const { errorHandler, defaultRoute } = this.service!.getConfigOptions();
                await versionRouteNext(middlewares, <any>req, <any>res, 0, defaultRoute, errorHandler);
                

            } catch (e) {
                await next(e);
            }
        }
    }
}