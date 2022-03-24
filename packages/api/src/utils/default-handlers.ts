import { DefaultController, ErrorController, Logger } from "../decorators";
import { DefaultRoute, LoggerInterface, ServerResponse, ServerRequest, VersionHandler } from "../types";

export const defaultVersionHandler: VersionHandler = (req: ServerRequest) => {
    return req.headers['version'] || 'default';
}

@ErrorController() 
export class DefaultErrorHandler {
    
    @Logger({
        name: 'DefaultErrorHandler'
    })
    logger!: LoggerInterface;

    public handleError(err: Error, req: ServerRequest, res: ServerResponse): void | Promise<unknown> {
        const message = 'There was an uncaught error on the server.';
        this.logger.error(err, message);
        res.statusCode = 500;
        res.send({
            message,
            error: err.message
        });
    }
}

@DefaultController()
export class DefaultRouteController {
    handleDefaultRoute(req: ServerRequest, res: ServerResponse): void | Promise<unknown>{
        
        res.statusCode = 404;
        res.send({
            message: `Route ${req.url} not found for the ${req.version}`
        });
    };
    
}

let requestId = 1;

export const defaultRequestIdHandler = (req: ServerRequest): string | number=> {
    return requestId++;
}
