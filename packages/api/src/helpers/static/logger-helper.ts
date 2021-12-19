import pino from "pino"
import { ApplicationDefinition, LoggerInterface } from "../.."
import { Protocol } from "../../types"
import { setLogger } from "../../utils/logger"

export class LoggerHelper {
    static isValidLogger(logger: any) {
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

    static setupLogger<T extends Protocol>(applicationDefinition: ApplicationDefinition<T>) {
        const { useLogger } = applicationDefinition;

        if (useLogger && (LoggerHelper.isValidLogger(applicationDefinition.useLogger) || typeof useLogger === 'object')) {
            setLogger(useLogger);
        } else {
            setLogger(pino());
        }
    }
}