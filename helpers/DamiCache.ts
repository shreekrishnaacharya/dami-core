interface DamiConfig {
  ttl?: number;
  expireOn?: number;
}
enum DCType {
  VALUE = 'value',
  TTL = 'ttl',
  EXPIRE_ON = 'expireOn'
}
export default class DamiCache {
  private cacheData: object;
  private defaultTtl: number;
  private defaultExpire: number;
  private loopTime: number;
  constructor(config?: DamiConfig) {
    let defaultConf = {
      isJwt: false,
      cacheData: {},
      ttl: 0,
      expireOn: 0,
      loopTime: 10, // sec
    };
    if (config !== undefined) {
      defaultConf = {
        ...defaultConf,
        ...config,
      };
    }
    this.cacheData = defaultConf.cacheData;
    this.defaultExpire = defaultConf.expireOn;
    this.defaultTtl = defaultConf.ttl;
    this.loopTime = defaultConf.loopTime;
    setInterval(() => {
      this.registerTtl();
    }, this.loopTime * 1000);
  }
  set(id: string, value: any, config?: DamiConfig) {
    let val = { ttl: this.defaultTtl, expireOn: this.defaultExpire };
    if (config !== undefined) {
      val = {
        ...val,
        ...config,
      };
    }
    this.cacheData[id] = {
      ...val,
      value,
    };
  }

  config(id: string, config?: DamiConfig): void {
    if (this.has(id)) {
      const val = this.cacheData[id];
      this.cacheData[id] = {
        ...val,
        ...config,
        value: val.value,
      };
    }
  }

  get(id: string): any {
    if (this.has(id)) {
      return this.cacheData[id][DCType.VALUE];
    }
    return undefined;
  }
  has(id: string): boolean {
    return this.cacheData.hasOwnProperty(id) ? true : false;
  }
  del(id: string): void {
    delete this.cacheData[id];
  }
  keys(): Array<any> {
    return Object.keys(this.cacheData);
  }
  flush(): void {
    this.cacheData = {};
  }
  count(): number {
    return Object.keys(this.cacheData).length;
  }

  private timeOut(id: string, time: number): void {
    this.cacheData[id][DCType.TTL] = 0;
    setTimeout(() => {
      if (this.cacheData[id][DCType.TTL] === 0) {
        delete this.cacheData[id];
      } else {
        const seconds = new Date().getTime() / 1000;
        const remining = this.cacheData[id] - seconds;
        if (remining <= this.loopTime) {
          delete this.cacheData[id];
        }
      }
    }, time * 1000);
  }

  private registerTtl(): void {
    for (const key of Object.keys(this.cacheData)) {
      const value = this.cacheData[key];
      const seconds = new Date().getTime() / 1000;
      if (value[DCType.TTL] > 0) {
        if (value[DCType.TTL] <= this.loopTime) {
          this.timeOut(key, value[DCType.TTL]);
        } else {
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
