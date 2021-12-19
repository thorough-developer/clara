import { Constructable, Inject, Token } from "typedi";

export function Resource(serviceName?: string): Function;

export function Resource(typeFn: (type?: never) => Constructable<unknown>): Function;

export function Resource(token?: Token<unknown>): Function;

export function Resource(resourceParameter?: any): Function {
    return function (target: any, propertyName: string, index: number) {
        Inject(resourceParameter)(target, propertyName, index);
    }
}