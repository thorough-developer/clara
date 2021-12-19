import { asyncLocalStorage } from "../utils/async-local-storage";
import { AbstractHelper } from "./abstract-helper";

import bodyParser = require('body-parser');
import { Protocol } from "../types";

export class ApplicationClaraMiddlewareHelper<T extends Protocol> extends AbstractHelper<T> {
    initMiddleware() {
        this.setBodyParser();
        this.setSessionContext();
    }

    setBodyParser() {
        this.service?.use((req, res, next) => {
            return new Promise(resolve => {
                bodyParser.json()(<any>req, <any>res, (err) => {
                    return resolve(next(err))
                })
            })
        });
    }

    setSessionContext() {
        this.service?.use((req, res, next) => {
            asyncLocalStorage.run(new Map(Object.entries({})), () => {
                next();
            });
        });
    }
}