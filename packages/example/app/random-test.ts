import { ScheduledTask, ScheduleResource, ServerResponse, Service, Resource, Middleware, Controller, Route, SessionContext, LocalSessionContext, LoggerInterface, Logger, ServerRequest } from '@clara/api';

@ScheduleResource()
export class MyScheduledResource {

    @Logger({ name: 'Scheduler'})
    private logger: LoggerInterface | undefined;

    @ScheduledTask('* * * * *')
    public runCron() {
        this.logger?.info('running a task every minute from a cron');
    }

    @ScheduledTask(60000)
    public runEveryMs() {
        this.logger?.info('running a task every minute from an interval');
    }
}

@Middleware()
export class OtherControllerLevelMiddleware {

    @SessionContext()
    myContext!: LocalSessionContext;

    public async run(req: ServerRequest, res: ServerResponse, next: any) {
        this.myContext.set('randomNumber', Math.random());

        await next();
    }  
}

@Middleware()
export class ControllerLevelMiddleware {

    @SessionContext()
    myContext: LocalSessionContext | undefined;

    public run(req: ServerRequest, res: ServerResponse, next: Function) {
        const idNumber = req.headers['x-id-number'];
        this.myContext?.set('idNumber', idNumber);
        next();
    }  
}

@Service()
export class MyService {
    @Logger({ name: 'MyService'})
    logger: LoggerInterface | undefined;

    public printMessage(message: string) {
        this.logger?.info(message);
    }
}

@Middleware()
export class RouteLevelMiddleware {
    @SessionContext()
    myContext: LocalSessionContext | undefined;

    run(req: ServerRequest, res: ServerResponse, next: Function) {
        const sing = 'some song';
        this.myContext?.set('sing', sing);
        next();
    }
}

@Controller({
    basePath: '/my'
})
export class MyController {

    @SessionContext()
    myContext!: LocalSessionContext;

    @Resource()
    service!: MyService;

    @Route({
        path: '/ruler',
        method: 'GET',
        middleware: [
            RouteLevelMiddleware
        ]
    })
    getRuler(req: ServerRequest, res: ServerResponse){
        this.service.printMessage('delete record my controller');
        return res.send({
            'user': this.myContext?.get('user'),
            'id': this.myContext?.get('idNumber'),
            'sing': this.myContext?.get('sing')
        });
    }

};


