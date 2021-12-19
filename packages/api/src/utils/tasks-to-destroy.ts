import assert from 'assert';
import { getLogger } from '../utils/logger';
const { register } = require('on-exit-leak-free');
export const tasksToDestroy: {[key:string]: Function}[] = [];

let processKilledNoLeaks = false;

export function killTasks (taskList: { [methodName: string]: Function }[] = [], eventName: string) {
    const { length } = taskList;
    taskList.forEach((task) => {
        Object.entries(task).forEach(([name, destroyFunc]) => {
            getLogger()?.info(`Destroying task ${name} after event: ${eventName}`);
            destroyFunc();
        })
    })

    processKilledNoLeaks = true;
}

register(tasksToDestroy, killTasks);

process.on('exit', () => {
    getLogger()!.info('All scheduled tasks been shutdown: ', 
        assert.strictEqual(processKilledNoLeaks, true));
});
