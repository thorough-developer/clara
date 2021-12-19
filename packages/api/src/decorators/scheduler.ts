import { Service } from "./service";

export function ScheduleResource() {
    return function (target: any) {
        Reflect.defineMetadata('scheduler', true, target);
        Service()(target)
    }
}

export function ScheduledTask(cron: string): Function;
export function ScheduledTask(runEveryMs: number): Function;
export function ScheduledTask(job: (string | number)): Function {
    return function (target: any,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<any>) {
        Reflect.defineMetadata('scheduledTask', {
            job,
            propertyKey,
            target,
            descriptor
        }, target, propertyKey);
    }
}