export function PostConstruct() {
    return function(target: any, propertyKey: string, descriptor: any) {
        Reflect.defineMetadata('postConstruct', {
            descriptor
        }, target, propertyKey);

        return descriptor;
    }
}
