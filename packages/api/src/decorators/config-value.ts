import config = require('config');
import Container from 'typedi';

const claraConfig = {
    get(key: string) {
        return config.has(key) ? config.get(key) : undefined;
    }
};

export function ConfigValue(key: string): Function {
    return function (object: any, propertyName: string, index: number): void {
        let value: any;

        if (Container.has(key)) {
            value = Container.get(key);
        } else if (key.startsWith('${')) {
            const lookup = key.substring(key.indexOf("${") + 2, key.indexOf("}"));
            value = process.env[lookup];
        } else {
            value = claraConfig.get(key);
        }
        Container.registerHandler({ object, propertyName, index, value: containerInstance => value })
    }
}
