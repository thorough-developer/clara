import { ApplicationDefinition, ContextDefinition } from "../types"
import { defaultVersionHandler, defaultRequestIdHandler, DefaultErrorHandler,  DefaultRouteController } from "./default-handlers"

import { loggerSerializers } from "./logger";

const defaultApplicationDefinition: ApplicationDefinition | ContextDefinition = {
    name: 'Create a name',
    logRequests: true,
    logRequestFormat: loggerSerializers.req,
    logResponseFormat: loggerSerializers.res,
    useLogger: {},
    rootPath: '/',
    versionHandler: defaultVersionHandler,
    requestIdHandler: defaultRequestIdHandler,
    errorHandler: DefaultErrorHandler,
    defaultRoute: DefaultRouteController
}

export const shallowMerge = (to: any, from: any) => {
    const data = {...to};

    const fromEntries = Object.entries(from);
    const {length} = fromEntries;
    for (let i = length; --i;) {
        const [key, value] = fromEntries[i];
        if (value || typeof value === 'boolean') {
            data[key] = value;
        }
    }

    return data;
}
export const mergeApplicationDefaults = (applicationDefinition: ApplicationDefinition | ContextDefinition) => {
    return shallowMerge(defaultApplicationDefinition, applicationDefinition);
}
