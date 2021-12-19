import { Protocol, ServerResponse, ServerRequest } from "../types";
import { loggerNowTime, loggerSerializers } from "../utils/logger";
import { AbstractHelper } from "./abstract-helper"

export class ApplicationRouteInterceptorHelper<T extends Protocol> extends AbstractHelper<T> {

    logRequest(req: ServerRequest<T>) {
        this.logger.info({ ...this.applicationDefinition!.logRequestFormat!(req)});
    }

    logResponse(startTime: number, req: ServerRequest<T>, res: ServerResponse<T>) {
        const duration = loggerNowTime() - startTime;

        this.logger.info({...this.applicationDefinition!.logResponseFormat!(req, res), duration });
    }
    setRequestData(req: ServerRequest<T>) {
        req.version = this.applicationDefinition!.versionHandler!(req);
        req.requestId = this.applicationDefinition!.requestIdHandler!(req);
    }

    interceptLookup() {
        const handle = this.service!.handle.bind(this.service);
        if (this.applicationDefinition!.logRequests) {
            this.service!.handle = (req: ServerRequest<T>, res: ServerResponse<T>) => {
                const startTime = loggerNowTime();
                this.setRequestData(req);
                this.logRequest(req);
                res.on('close', () => {
                    this.logResponse(startTime, req, res);
                });
                handle(req, res);
            };
        } else {
            this.service!.handle = (req: ServerRequest<T>, res: ServerResponse<T>) => {
                const startTime = loggerNowTime();
                this.setRequestData(req);
                
                handle(req, res);
            };
        }
        
        
    }
}