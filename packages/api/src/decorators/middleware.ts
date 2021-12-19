import { Type, AbstractMiddleware } from "../types";
import { Service } from "./service";

export function Middleware() {
    return function<T extends Type<AbstractMiddleware>> (target: any) {
        Reflect.defineMetadata('middleware', true, target);
        
        Service()(target);
    }
}