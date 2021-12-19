import { Resource, Controller, ConfigValue, Route, LocalSessionContext, SessionContext, ServerRequest, ServerResponse } from "@clara/api";

import { ControllerLevelMiddleware, MyService, OtherControllerLevelMiddleware, RouteLevelMiddleware } from "./random-test";

@Controller({
    basePath: '/other',
    middleware: [ControllerLevelMiddleware]
})
class OtherController {
    
    count: number = 1;

    @SessionContext()
    myContext!: LocalSessionContext;

    @Resource()
    service!: MyService;

    @ConfigValue('my.config.value')
    myConfigValue!: string;

    @Route({
        path: '/getOther',
        method: 'GET',
        middleware: [RouteLevelMiddleware, OtherControllerLevelMiddleware]
    })
    getName(req: ServerRequest, res: ServerResponse){
        // this.service.printMessage('delete record other controller');
        return res.send({
            'user': this.myContext.get('user'),
            'id': this.myContext.get('idNumber'),
            'configValue': this.myConfigValue,
            'currentCallCount': this.count++,
            'randomNumber': this.myContext.get('randomNumber'),
            version: 1
        });
    }

    @Route({
        path: '/getOther',
        method: 'GET',
        version: '2',
        middleware: [RouteLevelMiddleware, OtherControllerLevelMiddleware]
    })
    getNameV2(req: ServerRequest, res: ServerResponse){
        // this.service.printMessage('delete record other controller');
        return res.send({
            'user': this.myContext.get('user'),
            'id': this.myContext.get('idNumber'),
            'configValue': this.myConfigValue,
            'currentCallCount': this.count++,
            'randomNumber': this.myContext.get('randomNumber'),
            version: 2
        });
    }
};

export default OtherController;