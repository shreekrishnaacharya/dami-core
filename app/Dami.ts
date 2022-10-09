import appConfig from '../config/app';
import DamiCache from '@damijs/cache';
import MiddleWare from './MiddleWare';
import * as _path from 'path';
import CType from "../config/ConfigTypes"
import { IDatabase, IPubdirConfig, IUserAuth, IUserAuthList, _IUserConfig, IDamiConfig } from "../config/IConfig"
import { Mysql } from '@damijs/mysql';
import IAuth from '../auth/IAuth';
const damiVar = [
  'port', 'publicDir', 'dbConfig', 'appName', 'basePath',
  'baseUrl', 'requiredLogin', 'beforeAction',
  'afterAction', 'rbac', 'loginUser', 'enableRbac'
]
class Dami {
  static appName: string
  static config: IDamiConfig;
  static port: number;
  static publicDir: IPubdirConfig;
  static dbConfig: IDatabase;
  static db: Mysql;
  static baseUrl: string;
  static basePath: string;
  static loginUser: IUserAuth | IUserAuthList;
  static enableRbac: boolean;
  private static store: DamiCache;
  private static _dirname: string;
  static authTokens: DamiCache;
  [x: string]: any;

  static init(configSetting: IDamiConfig) {
    const config = {
      ...appConfig,
      ...configSetting,
    };
    for (const conf of damiVar) {
      if (conf in config) {
        this[conf] = config[conf];
      }
    }
    if ('damiList' in config && config.damiList != undefined) {
      for (const dl of Object.keys({ ...config.damiList })) {
        Dami[dl] = config.damiList[dl];
      }
    }
    Dami.config = config;
    if (!(CType.RESOURCE_PATH in config)) {
      throw new Error('basePath config not setup!');
    }
    this.authTokens = new DamiCache();
    this.store = new DamiCache();
    this._dirname = _path.resolve(_path.dirname('')) + '/' + config[CType.RESOURCE_PATH] + '/';
  }
  static requiredLogin = (): boolean | [] => {
    return true;
  };
  static beforeAction = (): (MiddleWare)[] => {
    return [];
  };
  static afterAction = (): (MiddleWare)[] => {
    return [];
  };
  static rbac = (userModel, route): boolean => {
    return this.enableRbac ? false : true;
  };
  static set(key: string, value: any, config?: {
    ttl?: number;
    expireOn?: number;
  }) {
    this.store.set(key, value, config);
  }
  static has(key: string) {
    return this.store.has(key);
  }
  static get(key: string) {
    return this.store.get(key);
  }
  static getCurrentPath() {
    return _path.resolve();
  }

  static getPath(path?: string, name?: string) {
    if (path === undefined) {
      return this._dirname;
    }
    const dirnam = path;
    let letpath = '';
    if (path.charAt(0) === '@') {
      const sppath = path.split('/');
      if (sppath.length > 1) {
        sppath.shift();
        letpath = sppath.join('/');
      }
    }
    const config = Dami.config[CType.PATH];
    if (config != undefined && dirnam in config) {
      return this._dirname + config[dirnam] + letpath + (name === undefined ? '' : name);
    }
    throw new Error(`Path '${path}' not set`);
  }
  static setAuth(token: string, authModel: IAuth) {
    const config = authModel.getConfig();
    const { uid, sessionid, exp } = this.parseJwt(token);
    if (config.uniqueSession) {
      this.authTokens.set(uid, token, { ttl: config.refreshInactive, expireOn: exp });
    } else {
      this.authTokens.set(sessionid, token, { expireOn: exp });
    }
  }

  static hasAuth(value: string, authUser: IAuth) {
    const { uid, sessionid } = this.parseJwt(value);
    const config = authUser.getConfig()
    if (config.uniqueSession) {
      if (this.authTokens.has(uid)) {
        this.authTokens.config(uid, { ttl: config.refreshInactive });
        return true;
      }
    } else {
      if (this.authTokens.has(sessionid)) {
        this.authTokens.config(sessionid, { ttl: config.refreshInactive });
        return true;
      }
    }
    return false;
  }

  static deleteAuth(value: string, config: _IUserConfig) {
    const { uid, sessionid } = this.parseJwt(value);

    if (config.uniqueSession) {
      return this.authTokens.del(uid);
    } else {
      return this.authTokens.del(sessionid);
    }
  }

  static parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      //  console.log(e);
      return {};
    }
  }
}

export default Dami;
