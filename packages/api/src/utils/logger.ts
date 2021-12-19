import { ServerResponse } from "http";
import pino from "pino";
import Container from "typedi";
import { LoggerInterface, ServerRequest } from "..";


export function setLogger(logger: any) {
    Container.set('clara.logger', logger);
}

export function getLogger(): LoggerInterface | undefined {
    return Container.has('clara.logger') ? 
        Container.get('clara.logger'): undefined;
}

export function loggerNowTime() {
    const ts = process.hrtime()
    return (ts[0] * 1e3) + (ts[1] / 1e6)
}

export const loggerSerializers = {
    req: function asReqValue(req: ServerRequest) {
        return {
            method: req.method,
            url: req.url,
            routeVersion: req.version,
            hostname: req.hostname,
            remoteAddress: req.ip,
            remotePort: req.socket ? req.socket.remotePort : undefined,
            requestId: req.requestId
        }
    },
    err: pino.stdSerializers.err,
    res: function asResValue(req: ServerRequest, res: ServerResponse) {
        return {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            routeVersion: req.version,
            requestId: req.requestId
        }
    }
}