import 'reflect-metadata';

import http from 'http';
import pino from 'pino';
import { ClaraApp, Context, PostConstruct, ServerRequest, Application, ConfigValue, ServerResponse, LocalSessionContext, SessionContext, Logger, LoggerInterface, Middleware, ErrorController, DefaultController  } from '@clara/api';
import OtherController from './app/other-controller';
import { MyController, MyScheduledResource } from './app/random-test';

const helmet = require("helmet");

@Middleware()
export class RootMiddleware {

    @SessionContext()
    myContext!: LocalSessionContext;

    public run(req: ServerRequest, res: ServerResponse, next: Function) {
        const user = req.headers['user-id'];
        this.myContext?.set('user', user);
        next();
    }
}

@DefaultController()
class DefaultRouteController {
    handleDefaultRoute(req: ServerRequest, res: ServerResponse) {
        res.send({iDoNotExist: 'dawg'}, 404);
    };
}

@ErrorController()
class ErrorHandlerController {

    @Logger({name: 'ErrorHandler'})
    myLogger!: LoggerInterface;
   
    handleError(err: Error, req: ServerRequest, res: ServerResponse) {
        this.myLogger?.error(err, 'Not sure what happened');
        
        res.send({
            thereWasAnError: 'dawg',
            error: err.message
        });
    }
}


const logger = pino({
    base: {
        coolMan: 'yessir'
    },
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
});

@Context({
    name: 'MyContext',
    rootPath: '/my-context',
    controllers:[
        MyController,
        OtherController
    ],
})
class MyContext {

    @SessionContext()
    myContext!: LocalSessionContext;

    @ConfigValue('${JAVA_HOME}') 
    public javaHome!: string;

    @Logger({name: 'MyApplication'}) 
    private logger!: LoggerInterface;

    constructor( ) {
        
    }

    @PostConstruct()
    public afterResourcesLoaded() {
        this.logger.info(`apparently java home lives here: ${this.javaHome}`);
    }
}

@Application({
    name: 'MyApplication',
    rootPath: '/my-app',
    useLogger: logger,
    logRequests: false,
    controllers:[
        MyController,
        OtherController
    ],
    schedulers: [
       MyScheduledResource
    ],
    middleware: [
        helmet(),
        RootMiddleware
    ],
    contexts: [
        MyContext
    ],
    defaultRoute: DefaultRouteController,
    errorHandler: ErrorHandlerController
})
class MyApplication {

    @SessionContext()
    myContext!: LocalSessionContext;

    @ConfigValue('${JAVA_HOME}') 
    public javaHome!: string;

    @Logger({name: 'MyApplication'}) 
    private logger!: LoggerInterface;

    constructor( ) {
        
    }

    @PostConstruct()
    public afterResourcesLoaded() {
        this.logger.info(`apparently java home lives here: ${this.javaHome}`);
    }
}

const app = ClaraApp.build(MyApplication);

app.start(8888, '0.0.0.0').then(() => {
    console.log(app.routes());
}).catch((err: Error) => {
    logger.error(err, 'There was an error starting the server.');
});
