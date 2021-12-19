import Container from "typedi"
import { LocalSession } from "../utils/local-session"

export function SessionContext() {
    return function (object: any, propertyName: string, index?: number): any {
        if (!Container.has('clara.sessionContext')) {
            Container.set('clara.sessionContext', LocalSession);
        }
        Container.registerHandler({ object, propertyName, index, value: () => Container.get('clara.sessionContext') })
    }
}