import pino from "pino";
import { ApplicationDefinition } from "../../types";
import { setLogger } from "../../utils/logger"

export class LoggerHelper {
    static isValidLogger(logger?: any) {
        if (!logger) {
            return false
        }
    
        let result = true
        const methods = ['info', 'error', 'debug', 'fatal', 'warn', 'trace', 'child']
        for (let i = 0; i < methods.length; i += 1) {
            if (!logger[methods[i]] || typeof logger[methods[i]] !== 'function') {
                result = false
                break
            }
        }
        return result;
    }

    static setupLogger(applicationDefinition: ApplicationDefinition) {
        const { useLogger } = applicationDefinition;

        if (LoggerHelper.isValidLogger(applicationDefinition.useLogger)) {
            setLogger(useLogger);
        } else {
            setLogger(pino(useLogger || {}));
        }
    }
}