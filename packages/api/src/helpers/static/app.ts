import Container from "typedi";
import { App, Protocol, ServiceOptions, SERVER_DEF_TOKEN } from "../../types";
import restana from 'restana';

export class ClaraApp {
    
    public static build<T extends Protocol = Protocol.HTTP>(application: any, serviceOptions: ServiceOptions | restana.Service<T>): App {
        const app = <any>Container.get(application);
        return app.init(serviceOptions);
    }
}
