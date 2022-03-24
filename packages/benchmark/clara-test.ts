import "reflect-metadata"

import { Application, Route, Controller, ClaraApp, ServerService } from '@clara/api';
import {loadTest} from './load-test';

@Controller({
  basePath: '/controller'
})
class MyController {
  @Route({
        path: '/route',
        method: 'GET',
        schema: {
          response: {
            200: <any>{
              type: 'object',
              properties: {
                'a-route': { type: 'string'}
              },
              required: ['a-route']
            }
          }
        }
    })
    getRoute(req: any, res: any) {
      return res.send({
        'a-route': 'a-win'
      })
    }
}


@Application({
  name: 'MyApplication',
  rootPath: '/app',
  useLogger: {},
  logRequests: false,
  controllers: [
    MyController
  ]
})
class MyApp {}

const app: ServerService = ClaraApp.build(MyApp);

app.start(3000, '0.0.0.0').then(() => {
    loadTest('http://localhost:3000/app/controller/route');
}).catch((err: Error) => {
    app.logger.error(err, 'There was an error starting the server.');
});

