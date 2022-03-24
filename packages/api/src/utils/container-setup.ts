import Container from "typedi";

const alreadyLoaded:any[] = [];
let alreadyLoadedIndex = 0;

export const handleResource = (resource: any) => {
    const target = resource.constructor;
    if (!alreadyLoaded.includes(target)) {
        const targetProto = target.prototype;
        Object.getOwnPropertyNames(targetProto).forEach((method: string) => {
            if((Reflect.hasOwnMetadata('postConstruct', targetProto, method))) {
                resource[method]();
            }
        });
    }
    alreadyLoaded[alreadyLoadedIndex++] = target;
};

export const Handler = {
    apply: (target: any, thisArg: any, argumentsList: any) => {
        const resources = target(...argumentsList);
        
        if (Array.isArray(resources)) {
            for (const resource of resources) {
                handleResource(resource);
            }
        } else {
            handleResource(resources);
        }
        
        return resources;
    }
};

Container.get = new Proxy(Container.get.bind(Container), Handler);
Container.getMany = new Proxy(Container.getMany.bind(Container), Handler);
