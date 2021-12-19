import Container from "typedi";
import { AbstractMiddleware } from "../types";
import { Protocol } from "../types";
import { AbstractHelper } from "./abstract-helper";

export class ApplicationMiddlewareHelper<T extends Protocol = Protocol.HTTP> extends AbstractHelper<T> {
    loadRootLevelMiddleware(rootPath: string) {
        const globalMiddleware = this.applicationDefinition?.middleware || [];
        for (const Middleware of globalMiddleware ) {
            let func: any;
            if (typeof Middleware === 'function' && Middleware.prototype.run && Middleware.prototype.constructor) {
                const middleware: AbstractMiddleware<T> = <AbstractMiddleware<T>>Container.get(<any>Middleware);
                func = <any>middleware.run.bind(middleware);
            } else {
                func = <any>Middleware;
            }
            this.service?.use(rootPath, func);
        }
    }
}