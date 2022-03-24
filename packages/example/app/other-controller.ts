import { Resource, Controller, ConfigValue, JSONSchemaType  , Route, LocalSessionContext, SessionContext, ServerRequest, ServerResponse, RouteSchema } from "@clara/api";

import { ControllerLevelMiddleware, MyService, OtherControllerLevelMiddleware, RouteLevelMiddleware } from "./random-test";


interface GetOther {
    user?: string;
    id?: number;
    configValue: string;
    currentCallCount: number;
    randomNumber?: number;
    version: number;
}

const getOtherResponseSchema: JSONSchemaType<GetOther> = {
    type: 'object',
    properties: {
        configValue: { type: 'string'},
        currentCallCount: { type: 'integer'},
        randomNumber: { type: 'integer', nullable: true},
        version: { type: 'integer'},
        user: { type: 'string', nullable: true},
        id: { type: 'integer', nullable: true}
    },
    additionalProperties: false,
    required: ['configValue', 'currentCallCount', 'version'],

};

const mySchema: RouteSchema = {
    response: {
        200: <any>getOtherResponseSchema
    }
}


interface Name {
    hello: string;
    foo: string;
    name: string;
    currentCallCount: number;
    version: number;
}

const postNameSchema: RouteSchema = {
    requestBody: <any>{
        type: 'object',
        properties: {
            hello: { type: 'string'},
            foo: { type: 'string'}
        },
        additionalProperties: false
    },
    params: <any>{
        type: 'object',
        properties: {
            holdMe: {type: 'string'}
        },
        additionalProperties: false
    },
    query: <any>{
        type: 'object',
            properties: {
                name: {type: 'string'}
            },
            additionalProperties: false
    },
    response:{
        200: <any>{
            type: 'object',
            properties: {
                hello: { type: 'string'},
                foo: { type: 'string'},
                name: {type: 'string'},
                currentCallCount: { type: 'integer'},
                version: { type: 'integer'},
                holdMe: { type: 'string'}
            },
            additionalProperties: false
        }
    }
}
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
        schema: mySchema,
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
        path: '/getOther/:holdMe',
        method: 'POST',
        schema: postNameSchema,
        middleware: [RouteLevelMiddleware, OtherControllerLevelMiddleware]
    })
    postName(req: ServerRequest, res: ServerResponse){
        // this.service.printMessage('delete record other controller');
        const {params, body, query} = req;

        return res.send({
            ...query,
            ...params,
            ...body,
            'currentCallCount': this.count++,
            version: 1
        });
    }

    @Route({
        path: '/getOther',
        method: 'GET',
        version: '2.0',
        schema: mySchema,
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