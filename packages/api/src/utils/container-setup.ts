import Container from "typedi";

const alreadyLoaded:any[] = [];

export const handleResource = (resource: any) => {
    if (!alreadyLoaded.includes(resource.constructor)) {
        if (resource.afterResourcesLoaded) {
            resource.afterResourcesLoaded();
        }
    }
    alreadyLoaded.push(resource.constructor);
};

export const Handler = {
    apply: (target: any, thisArg: any, argumentsList: any) => {
        const resources = target(...argumentsList);
        
        if (Array.isArray(resources)) {
            for (const resource of resources) {
                handleResource(resources);
            }
        } else {
            handleResource(resources);
        }
        
        return resources;
    }
};

Container.get = new Proxy(Container.get.bind(Container), Handler);
Container.getMany = new Proxy(Container.getMany.bind(Container), Handler);
