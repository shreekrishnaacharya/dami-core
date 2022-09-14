import appConfig from '../config/app';
import DamiCache from '../helpers/DamiCache';
import MiddleWare from './MiddleWare';
import * as _path from 'path';
import CType from "../config/ConfigTypes"
import { IDatabase, IPubdirConfig, IUserConfig, IUserConfigList, _IUserConfig } from "../config/IConfig"
import Mysql from '../db/mysql';
class Dami {
  static config: object;
  static port: number;
  static publicDir: IPubdirConfig;
  static dbConfig: IDatabase;
  static db: Mysql = null;
  static baseUrl: string;
  static loginUser: IUserConfig | IUserConfigList;
  static enableRbac: boolean;
  private static store: DamiCache;
  private static _dirname: string;
  static authTokens: DamiCache;


  // setUser(userModel) {
  //   const rq = domain.create();
  //   rq.add(userModel)
  //   rq["_user"] = userModel
  // }
  // getUser() {
  // }

  static init(configSetting: object) {
    const config = {
      ...appConfig,
      ...configSetting,
    };
    for (const conf of Object.keys(config)) {
      this[conf] = config[conf];
    }
    Dami.config = config;
    if (config[CType.BASE_PATH].length === 0) {
      throw new Error('basePath config not setup!');
    }
    this.authTokens = new DamiCache();
    this.store = new DamiCache();
    this._dirname = _path.resolve(_path.dirname('')) + '/' + config[CType.BASE_PATH] + '/';
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

    if (dirnam in Dami.config[CType.PATH]) {
      return this._dirname + Dami.config[CType.PATH][dirnam] + letpath + (name === undefined ? '' : name);
    }
    throw new Error(`Path '${path}' not set`);
  }
  static setAuth(token: string, config: _IUserConfig) {
    const { uid, sessionid, exp } = this.parseJwt(token);
    if (this.loginUser.uniqueSession) {
      this.authTokens.set(uid, token, { ttl: config.refreshInactive, expireOn: exp });
    } else {
      this.authTokens.set(sessionid, token, { expireOn: exp });
    }
  }

  static hasAuth(value: string, config: _IUserConfig) {
    const { uid, sessionid } = this.parseJwt(value);
    if (this.loginUser.uniqueSession) {
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
