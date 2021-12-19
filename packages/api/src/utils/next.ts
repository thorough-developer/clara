import { Protocol } from "restana";
import { ServerRequest, ServerResponse } from "../types";

export function versionRouteNext<T extends Protocol>(middlewares: any[], req: ServerRequest, res: ServerResponse, index: number, defaultRoute: any, errorHandler: any) {
    const middleware = middlewares[index];

    if (!middleware) {
        console.log()
        if (!res.writableEnded) {
            return defaultRoute(req, res);
        }

        return;
    }

    function step (err: Error) {
        if(err) {
            return errorHandler(err, req, res);
        } else {
            return versionRouteNext(middlewares, req, res, index+1, defaultRoute, errorHandler);
        }
    }

    try {
        return middleware(req, res, step);
    } catch(err: any) {
        return errorHandler(err, req, res);
    }
}