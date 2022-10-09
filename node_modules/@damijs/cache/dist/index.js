var DCType;
(function (DCType) {
    DCType["VALUE"] = "value";
    DCType["TTL"] = "ttl";
    DCType["EXPIRE_ON"] = "expireOn";
})(DCType || (DCType = {}));
export default class DamiCache {
    constructor(config) {
        let defaultConf = {
            isJwt: false,
            cacheData: {},
            ttl: 0,
            expireOn: 0,
            loopTime: 10, // sec
        };
        if (config !== undefined) {
            defaultConf = Object.assign(Object.assign({}, defaultConf), config);
        }
        this.cacheData = defaultConf.cacheData;
        this.defaultExpire = defaultConf.expireOn;
        this.defaultTtl = defaultConf.ttl;
        this.loopTime = defaultConf.loopTime;
        setInterval(() => {
            this.registerTtl();
        }, this.loopTime * 1000);
    }
    set(id, value, config) {
        let val = { ttl: this.defaultTtl, expireOn: this.defaultExpire };
        if (config !== undefined) {
            val = Object.assign(Object.assign({}, val), config);
        }
        this.cacheData[id] = Object.assign(Object.assign({}, val), { value });
    }
    config(id, config) {
        if (this.has(id)) {
            const val = this.cacheData[id];
            this.cacheData[id] = Object.assign(Object.assign(Object.assign({}, val), config), { value: val.value });
        }
    }
    get(id) {
        if (this.has(id)) {
            return this.cacheData[id][DCType.VALUE];
        }
        return undefined;
    }
    has(id) {
        return this.cacheData.hasOwnProperty(id) ? true : false;
    }
    del(id) {
        delete this.cacheData[id];
    }
    keys() {
        return Object.keys(this.cacheData);
    }
    flush() {
        this.cacheData = {};
    }
    count() {
        return Object.keys(this.cacheData).length;
    }
    timeOut(id, time) {
        this.cacheData[id][DCType.TTL] = 0;
        setTimeout(() => {
            if (this.cacheData[id][DCType.TTL] === 0) {
                delete this.cacheData[id];
            }
            else {
                const seconds = new Date().getTime() / 1000;
                const remining = this.cacheData[id] - seconds;
                if (remining <= this.loopTime) {
                    delete this.cacheData[id];
                }
            }
        }, time * 1000);
    }
    registerTtl() {
        for (const key of Object.keys(this.cacheData)) {
            const value = this.cacheData[key];
            const seconds = new Date().getTime() / 1000;
            if (value[DCType.TTL] > 0) {
                if (value[DCType.TTL] <= this.loopTime) {
                    this.timeOut(key, value[DCType.TTL]);
                }
                else {
                    value[DCType.TTL] -= this.loopTime;
                }
            }
            if (value[DCType.EXPIRE_ON] > 0) {
                const remining = value[DCType.EXPIRE_ON] - seconds;
                if (remining <= this.loopTime) {
                    this.timeOut(key, remining);
                }
            }
        }
    }
}
