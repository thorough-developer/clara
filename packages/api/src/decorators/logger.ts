import pino, { Bindings, ChildLoggerOptions, LoggerOptions as LOptions } from "pino";
import Container from "typedi";
import { LoggerInterface } from "../types";
import { getLogger } from "../utils/logger";

const LoggerImpl: LoggerInterface = {
    child(bindings: pino.Bindings, options?: pino.ChildLoggerOptions) {
        return getLogger()?.child(bindings, options);
    },
    fatal(obj: any, msg?: string, ...args: any[]) {
        getLogger()?.fatal(obj, msg, args);
    },
    error(obj: any, msg?: string, ...args: any[]) {
        getLogger()?.error(obj, msg, args);
    },
    debug(obj: any, msg?: string, ...args: any[]) {
        getLogger()?.debug(obj, msg, args);
    },
    warn(obj: any, msg?: string, ...args: any[]) {
        getLogger()?.warn(obj, msg, args);
    },
    trace(obj: any, msg?: string, ...args: any[]) {
        getLogger()?.trace(obj, msg, args);
    },
    info(obj: any, msg?: string, ...args: any[]) {
        getLogger()?.info(obj, msg, args);
    },
    silent(obj: any, msg?: string, ...args: any[]) {
        getLogger()?.silent(obj, msg, args);
    }
};

export function Logger(bindings: Bindings, options?: ChildLoggerOptions) {
    return function (object: any, propertyName: string, index?: number): any {

        Container.registerHandler({ object, propertyName, index, value: () => {
            return LoggerImpl.child(bindings);
        }});
        
    };
}