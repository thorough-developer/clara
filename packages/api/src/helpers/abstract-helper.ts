import { Service } from "restana";
import { LoggerInterface, Protocol, ApplicationDefinition } from '../types';

export interface HelperParams<T extends Protocol> {
    service?: Service<any>;
    applicationDefinition?: ApplicationDefinition<T>;
    logger: LoggerInterface;
}

export class AbstractHelper<T extends Protocol> {
    protected service?: Service<any>;
    protected applicationDefinition?: ApplicationDefinition<T>;
    protected logger: LoggerInterface;

    constructor(helperParams: HelperParams<T>){
        const {service, logger, applicationDefinition} = helperParams;
        this.service = service;
        this.logger = <LoggerInterface>logger.child({ name: this.constructor.name });
        this.applicationDefinition = applicationDefinition;
    }
}