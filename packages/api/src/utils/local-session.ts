import { asyncLocalStorage } from "./async-local-storage";

export const LocalSession: any = {
    set: (key: string, value: any) => {
        const store = asyncLocalStorage.getStore();

        if (store != null) {
            store.set(key, value);
        }
    },
    get: (key: string) => {
        const store = asyncLocalStorage.getStore();

        return store != null ? store.get(key) : undefined;
    }
}