import LogTrack from '../log/LogTrack';
import { Connection } from '../models/Connection';
import Mysql from '../db/mysql';
import Methods from '../controllers/Methods';
import cors from 'cors';
import Dami from './Dami';
import { initRbac } from '../helpers/rbac';
import FileUpload from 'express-fileupload';
import MigrateList from '../migration/controllers/index';
import _fs from 'fs';
import express from 'express';
import HttpCode from '../helpers/HttpCode';
import Cattr from "../config/ConfigTypes"

import * as _path from 'path';
import { fileURLToPath } from 'url';
import Controller from '../controllers/Controller';
import { IDamiConfig } from '../config/IConfig';

const __dirname = _path.dirname(fileURLToPath(import.meta.url));

class DamiApp {
  static config: object;
  private controllers: object;
  private app: any
  constructor() {
    this.app = express();
  }
  getApp() {
    return this.app;
  }
  getExpress() {
    return express;
  }
  init = (configSetting: IDamiConfig) => {
    Dami.init(configSetting);
    // if (!configSetting.hasOwnProperty('controllers') || configSetting['controllers'] === null) {
    //     throw new Error('Controllers not set in config file')
    // }
    this.controllers = configSetting[Cattr.CONTROLLER];
    if (Dami.dbConfig) {
      Connection.mysql = new Mysql(Dami.dbConfig);
      Dami.db = Connection.mysql;
      if (Dami.enableRbac) {
        initRbac();
      }
    }
  };
  configReq = (req, res, next) => {
    req.user = null;
    next();
  };
  run = (initRun?: (app: any) => {}) => {
    const app = this.app;
    const track = new LogTrack();
    let count = 0;
    const corsOptions = {
      exposedHeaders:
        'x-pagination-current-page,x-pagination-page-count,x-pagination-per-page,x-pagination-total-count',
    };
    if (!_fs.existsSync(Dami.config[Cattr.BASE_PATH])) {
      _fs.mkdirSync(Dami.config[Cattr.BASE_PATH]);
    }
    app.use(cors(corsOptions));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(
      FileUpload({
        createParentPath: true,
        parseNested: true,
        uriDecodeFileNames: true,
        useTempFiles: true,
      }),
    );
    if ('viewEngine' in Dami.config) {
      app.set('view engine', Dami.config.viewEngine);
    }
    app.use(this.configReq);
    app.use((req, res, next) => {
      // req.counter = Math.floor(Math.random() * 10000)
      count++;
      // req.counter = count
      // console.log("Counter : " + count)
      // console.log(Dami.authTokens);
      next();
    });

    // app.use((req, res, next) => {
    //   console.log("1 Counter : " + count + " Req :" + req.counter)
    //   next();
    // });
    app.use(track.start);
    if (initRun) {
      initRun(app)
    }
    const controllers = this.getControllers(this.controllers);
    for (const contr of controllers) {
      const [control, controller] = contr
      const router = express.Router();
      controller.setPath(`/${control}`);
      const routList = controller.route();
      for (const ba of controller.beforeAction()) {
        const middle = new ba(controller);
        console.log(middle)
        app.use(`/${control}`, middle.run);
      }
      for (const { method, path, action } of routList) {
        switch (method) {
          case Methods.GET:
            router.get(path, controller[action]);
            break;
          case Methods.POST:
            router.post(path, controller[action]);
            break;
          case Methods.PUT:
            router.put(path, controller[action]);
            break;
          case Methods.DELETE:
            router.delete(path, controller[action]);
            break;
          default:
            throw new Error(`Method '${method}' does not exist for route '${control}'`);
        }
      }
      app.use(`/${control}`, router);

      /**
       * after action
       */
      for (const aa of controller.afterAction()) {
        const middle = new aa(controller);
        app.use(`/${control}`, middle.run);
      }
    }
    // app.use((req, res, next) => {
    //   setTimeout(() => console.log("2 Counter : " + count + " Req :" + req.counter), 100)
    //   next();
    // });
    // app.use((req, res, next) => {
    //   console.log(process)
    //   setTimeout(() => {
    //     next();
    //   }, 5000)
    // });

    /**
     * this is where dami auto code generator is register
     */
    app.use(`/${Cattr.APP_NAME}`, (req, res, next) => {
      if (Object.keys(Dami.dbConfig).length === 0) {
        res.status(HttpCode.BAD_GATEWAY).send('Db not configured').end();
      } else {
        next();
      }
    });
    for (const control of Object.keys(MigrateList)) {
      const router = express.Router();
      const controller = MigrateList[control];
      controller.setPath(`/${control}`);
      const routList = controller.route();
      for (const { method, path, action } of routList) {
        switch (method) {
          case Methods.GET:
            router.get(path, controller[action]);
            break;
          case Methods.POST:
            router.post(path, controller[action]);
            break;
          case Methods.PUT:
            router.put(path, controller[action]);
            break;
          case Methods.DELETE:
            router.delete(path, controller[action]);
            break;
          default:
            throw new Error(`Method '${method}' does not exist for route '${control}'`);
        }
      }
      let tmpControl = '/' + control;
      if (control === Cattr.APP_NAME) {
        tmpControl = '';
      }
      app.use(`/${Cattr.APP_NAME + tmpControl}`, router);
    }
    app.get(`/${Cattr.APP_NAME}`, express.static(__dirname + "/../migration/resource/client"));
    if (Object.values(Dami.publicDir).length > 0) {
      if (Dami.publicDir.from != undefined) {
        app.use(Dami.publicDir.from, express.static(Dami.publicDir.path));
      } else {
        app.use(express.static(Dami.publicDir.path));
      }
    }
    app.use(track.memory);
    app.use(track.time);
    app.use(track.end);
    // app.use((req, res, next) => {
    //   console.log("3 Counter : " + count + " Req :" + req.counter)
    //   next()
    // });

    app.listen(Dami.port, () => console.log(`Your app listening on port ${Dami.port}!`));
  };

  private getControllers(controller: object, newController: Array<any> = [], con = '') {
    for (const cont of Object.keys(controller)) {
      if (!(controller[cont] instanceof Controller)) {
        newController = this.getControllers(controller[cont], newController, con == '' ? cont : con + '/' + cont)
      } else {
        newController.push([con == '' ? cont : con + '/' + cont, controller[cont]])
      }
    }
    return newController;
  }
}

export default DamiApp;
