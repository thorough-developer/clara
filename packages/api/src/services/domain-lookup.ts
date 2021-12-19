import restana from "restana";
import { Service } from "typedi";
import { asyncLocalStorage } from "../utils/async-local-storage";

let router: restana.Router<any>; 

export function setService(service: restana.Service<any>) {
    router = service.getRouter();
}

export interface DomainLookup {

}
export function domainLookup(req, res) {
    
}