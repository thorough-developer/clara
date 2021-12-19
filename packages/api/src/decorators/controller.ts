import restana, { Protocol } from "restana";
import { ControllerDefinition, Type, RouteDefinition, RouteHandler, DefaultRoute, HandleError } from "../types";
import { Service } from "./service";

export function Controller(controllerDefinition?: ControllerDefinition) {

    return function (target: any) {
        Reflect.defineMetadata('controller', controllerDefinition, target);
        Service()(target);
    }

}

export function DefaultController() {
    return function<T extends Type<DefaultRoute>> (target: T) {
        Service()(target);
    }
}

export function ErrorController() {
    return function<T extends Type<HandleError>> (target: T) {
        Service()(target);
    }
}


export function Route(routeDefinition: RouteDefinition) {
    return function<T extends Protocol> (target: any,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<RouteHandler<T>>): TypedPropertyDescriptor<RouteHandler<T>>  {
        Reflect.defineMetadata('route', {
            routeDefinition,
            propertyKey,
            target,
            descriptor
        }, target, propertyKey);
        return descriptor;
    }
}