import { DefaultController, ErrorController, Logger } from "../decorators";
import { DefaultRoute, LoggerInterface, Protocol, ServerResponse, ServerRequest, VersionHandler } from "../types";

export const defaultVersionHandler: VersionHandler = (req: ServerRequest) => {
    return req.headers['version'] || 'default';
}

@ErrorController() 
export class DefaultErrorHandler<T extends Protocol> {
    
    @Logger({
        name: 'DefaultErrorHandler'
    })
    logger!: LoggerInterface;

    public handleError(err: Error, req: ServerRequest<T>, res: ServerResponse<T>): void | Promise<unknown> {
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
export class DefaultRouteController<T extends Protocol> {
    handleDefaultRoute(req: ServerRequest<T>, res: ServerResponse<T>): void | Promise<unknown>{
        console.log('in the route here', res.send);
        
        res.statusCode = 404;
        res.send({
            message: `Route ${req.url} not found for the ${req.version}`
        });
    };
    
}

let requestId = 1;

export const defaultRequestIdHandler = <T extends Protocol = Protocol.HTTP>(req: ServerRequest<T>): string | number=> {
    return requestId++;
}
