import { ServiceOptions, Service as TypeDiService } from "typedi";

export function Service<T = unknown>(): Function;
export function Service<T = unknown>(options: ServiceOptions<T>): Function;
export function Service<T>(options: ServiceOptions<T> = {}): ClassDecorator {
    return target => {
        return TypeDiService(options)(target);
    }
}