import { ApplicationDefinition, VersionHandler, ContextDefinition } from "../types"
import { defaultVersionHandler, defaultRequestIdHandler, DefaultErrorHandler,  DefaultRouteController } from "./default-handlers"

import { loggerSerializers } from "./logger";
import { Protocol } from "restana";

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
        if (value) {
            data[key] = value;
        }
    }

    return data;
}
export const mergeApplicationDefaults= <T extends Protocol = Protocol.HTTP> (applicationDefinition: ApplicationDefinition<T> | ContextDefinition<T>) => {
    return shallowMerge(defaultApplicationDefinition, applicationDefinition);
}
