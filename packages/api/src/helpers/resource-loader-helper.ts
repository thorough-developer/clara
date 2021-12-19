import { Protocol } from "../types";
import { AbstractHelper, HelperParams } from "./abstract-helper";
import { ApplicationControllerHelper } from "./application-controller-helper";
import { ApplicationMiddlewareHelper } from "./application-middleware-helper";
import { ApplicationSchedulerHelper } from "./application-scheduler-helper";

export class ApplicationResourceLoaderHelper<T extends Protocol> extends AbstractHelper<T>{
    private applicationControllerHelper: ApplicationControllerHelper<T>;
    private applicationMiddlewareHelper: ApplicationMiddlewareHelper<T>;
    private applicationSchedulerHelper: ApplicationSchedulerHelper<T>;

    constructor(helperParams: HelperParams<T>) {
        super(helperParams);

        this.applicationControllerHelper = this.getApplicationControllerHelper();
        this.applicationMiddlewareHelper = this.getApplicationMiddlewareHelper();
        this.applicationSchedulerHelper = this.getApplicationSchedulerHelper();
    }

    getApplicationControllerHelper(): ApplicationControllerHelper<T> {
        const { service, logger, applicationDefinition } = this;
        return new ApplicationControllerHelper({
            service,
            logger,
            applicationDefinition
        });
    }

    getApplicationMiddlewareHelper(): ApplicationMiddlewareHelper<T> {
        const { service, logger, applicationDefinition } = this;
        return new ApplicationMiddlewareHelper({
            service,
            logger,
            applicationDefinition
        });
    }

    getApplicationSchedulerHelper(): ApplicationSchedulerHelper<T> {
        const { logger, applicationDefinition } = this;

        return new ApplicationSchedulerHelper({
            logger,
            applicationDefinition
        });
    }

      
    loadResources(rootPath: string) {
        // order of these matter
        this.applicationMiddlewareHelper.loadRootLevelMiddleware(rootPath);
        this.applicationControllerHelper.loadControllers(rootPath);
        this.applicationSchedulerHelper.initSchedulers();
    } 

}