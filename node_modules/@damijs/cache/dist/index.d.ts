interface DamiConfig {
    ttl?: number;
    expireOn?: number;
}
export default class DamiCache {
    private cacheData;
    private defaultTtl;
    private defaultExpire;
    private loopTime;
    constructor(config?: DamiConfig);
    set(id: string, value: any, config?: DamiConfig): void;
    config(id: string, config?: DamiConfig): void;
    get(id: string): any;
    has(id: string): boolean;
    del(id: string): void;
    keys(): Array<any>;
    flush(): void;
    count(): number;
    private timeOut;
    private registerTtl;
}
export {};
