import { schedule } from "node-cron";
import Container from "typedi";
import { Protocol } from "../types";
import { tasksToDestroy } from "../utils/tasks-to-destroy";
import { AbstractHelper } from "./abstract-helper";

export class ApplicationSchedulerHelper<T extends Protocol> extends AbstractHelper<T> {
    initSchedulers() {
        for (const ScheduledResource of this.applicationDefinition?.schedulers || [] ) {
            const scheduledResource: any = Container.get(<any>ScheduledResource);

            const methods = Object.getOwnPropertyNames(scheduledResource.constructor.prototype);

            for (const func of methods) {
                const funcMetaData = Reflect.getMetadata('scheduledTask', scheduledResource, func);

                const runnableFunc = scheduledResource[func].bind(scheduledResource);

                if (funcMetaData) {
                    const name = `${ScheduledResource.name}.${funcMetaData.propertyKey}`;
                
                    switch (typeof funcMetaData.job) {
                        case 'string':
                            const task1 = schedule(funcMetaData.job, runnableFunc);
                            tasksToDestroy.push({ [name]: () => task1.stop()});
                            break;
                        case 'number':
                            const task2 = setInterval(runnableFunc, funcMetaData.job);
                            tasksToDestroy.push({ [name]: () => clearInterval(task2)});
                            break;
                    }
                }
            }
        }
    }
}