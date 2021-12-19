import 'reflect-metadata';

import http from 'http';
import pino from 'pino';
import { ClaraApp, Context, DefaultRoute, ServerRequest, Application, ConfigValue, ServerResponse, LocalSessionContext, SessionContext, Logger, LoggerInterface, Middleware, AbstractMiddleware, AfterResourcesLoaded, ErrorController, HandleError, DefaultController  } from '@clara/api';
import OtherController from './app/other-controller';
import { ControllerLevelMiddleware, MyController, MyScheduledResource } from './app/random-test';

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
        console.log('in the route here', res.send);
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
const story = http.createServer();

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
class MyContext implements AfterResourcesLoaded {

    @SessionContext()
    myContext!: LocalSessionContext;

    @ConfigValue('${JAVA_HOME}') 
    public javaHome!: string;

    @Logger({name: 'MyApplication'}) 
    private logger!: LoggerInterface;

    constructor( ) {
        
    }

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
        RootMiddleware,
        helmet()
    ],
    contexts: [
        MyContext
    ],
    defaultRoute: DefaultRouteController,
    errorHandler: ErrorHandlerController
})
class MyApplication implements AfterResourcesLoaded {

    @SessionContext()
    myContext!: LocalSessionContext;

    @ConfigValue('${JAVA_HOME}') 
    public javaHome!: string;

    @Logger({name: 'MyApplication'}) 
    private logger!: LoggerInterface;

    constructor( ) {
        
    }

    public afterResourcesLoaded() {
        this.logger.info(`apparently java home lives here: ${this.javaHome}`);
    }
}

const app = ClaraApp.build(MyApplication, {
    routerCacheSize: 1000,
    server: story
});

app.start(8888, '0.0.0.0').then((instance: any) => {
    logger.info(instance.address(), `Listening to requests`);
}).catch((err: Error) => {
    logger.error(err, 'There was an error starting the server.');
});
