import { ClaraApp } from '..';

ClaraApp.run = () => {};

import restana from 'restana';
import Container, { Token } from 'typedi';
import { ApplicationControllerHelper } from '../helpers/application-controller-helper';
import { Type } from '../types';
import * as LightMyRequest from 'light-my-request'
import {  setLogger } from '../utils/logger';
import { ApplicationClaraMiddlewareHelper } from '../helpers/application-clara-middleware-helper';
import { ApplicationMiddlewareHelper } from '../helpers/application-middleware-helper';

export type ResourceInjectType = {
    id: string | Type<any> | Token<any>;
    value: any
};

export function testInject<T>(classToInject: Type<T>, mocks?: ResourceInjectType[]): T {

    mocks?.forEach((mock) => {
        if (mock.id instanceof Token || typeof mock.id === 'object') {
            Container.set(mock.id, mock.value);
        } else {
            Container.set(mock);
        }
    });


    return Container.get(classToInject);
}

const fakeLogger: any = {
    info: () => { },
    error: () => { },
    child: function () {
        return this;
    },
    fatal: () => { },
    warn: () => { },
    debug: () => { },
    trace: () => { },
    silent: () => { }
};

export async function testRoutableController<T>(classToInject: Type<T>, mocks?: ResourceInjectType[], rootLevelMiddleware?: []): Promise<any>;
export async function testRoutableController<T>(classToInject: Type<T>, rootLevelMiddleware?: []): Promise<any>;
export async function testRoutableController<T>(classToInject: Type<T>, mocks?: ResourceInjectType[], rootLevelMiddleware?: []): Promise<any> {

    if (!mocks?.some((mock: ResourceInjectType) => mock.id === 'clara.logger')) {
        setLogger(fakeLogger);
    }

    const controller = testInject(classToInject, mocks);
    const service = restana();
    
    const applicationClaraMiddlewareHelper = new ApplicationClaraMiddlewareHelper({
        logger: fakeLogger,
        service
    });

    await applicationClaraMiddlewareHelper.initMiddleware();

    const applicationMiddlewareHelper =  new ApplicationMiddlewareHelper( {
        logger: fakeLogger,
        applicationDefinition: {
            middleware: rootLevelMiddleware
        },
        service
    });

    // await applicationMiddlewareHelper.loadRootLevelMiddleware();

    const controllerHelper = new ApplicationControllerHelper({
        logger: fakeLogger,
        service,
        applicationDefinition: {
            rootPath: ''
        }
    });

    

    await controllerHelper.loadControllers([(<any>controller).constructor]);

    
    function request(options: string | LightMyRequest.InjectOptions, callback?: LightMyRequest.CallbackFunc): LightMyRequest.Chain | undefined {
        if (callback) {
            LightMyRequest.inject(<any>service, options, callback);
            return;
        }
        return LightMyRequest.inject(<any>service, options);
    }


    return {
        request
    }
}

/*
testRoutableController(OtherController, ).then(async ({ request }) => {
    console.log(await request({
        method: 'GET',
        url: '/other/getOther',
        headers: {
            'x-id-number': 5555,
            'user-id': 'cwashington'
        }
    }));
});
*/