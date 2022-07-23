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

class DamiApp {
  static config: object;
  private controllers: object;
  init = (configSetting: object) => {
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
  run = () => {
    const app = express();
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
    app.use(this.configReq);
    app.use((req, res, next) => {
      count++;
      console.log(Dami.authTokens);
      next();
    });
    app.use(track.start);

    const controllers = this.controllers;
    for (const control of Object.keys(controllers)) {
      const router = express.Router();
      const controller = controllers[control];
      controller.setPath(`/${control}`);
      const routList = controller.route();
      for (const ba of controller.beforeAction()) {
        const middle = new ba(controller);
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
      for (const aa of controller.afterAction()) {
        const middle = new aa(controller);
        app.use(`/${control}`, middle.run);
      }
    }
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
    app.use(track.memory);
    app.use(track.time);
    app.use(track.end);
    app.listen(Dami.port, () => console.log(`Your app listening on port ${Dami.port}!`));
  };
}

export default DamiApp;
