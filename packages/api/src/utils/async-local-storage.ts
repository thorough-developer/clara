import { AsyncLocalStorage } from "async_hooks";

interface MapInterface {
    get(key: string): any;
    set(key: string, value: any): void;
}

export const asyncLocalStorage = new AsyncLocalStorage<MapInterface>();