import Container from "typedi";
import { ServerService } from "../../types";


export class ClaraApp {
    
    public static build(application: any, service?: ServerService): ServerService {
        const app = <any>Container.get(application);
        return app.init(service);
    }
}
