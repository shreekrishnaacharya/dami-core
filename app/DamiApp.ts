import LogTrack from '../log/LogTrack';
import { Mysql } from '@damijs/mysql';
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
import { IControllerList, IDamiConfig, IServerRender } from '../config/IConfig';
import DamiConfigure from '../config/ConfigTypes';
import { isEmpty } from '@damijs/hp';

const __dirname = _path.dirname(fileURLToPath(import.meta.url));

class DamiApp {
  static config: object;
  private controllers: IControllerList | null;
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
      Dami.db = new Mysql(Dami.dbConfig);
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
    const configBasePath = Dami.config[Cattr.BASE_PATH];
    if (configBasePath != undefined) {
      if (!_fs.existsSync(configBasePath)) {
        _fs.mkdirSync(configBasePath);
      }
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
      next();
    });

    if (Object.values(Dami.publicDir).length > 0) {
      if (Dami.publicDir.from != undefined) {
        app.use(Dami.publicDir.from, express.static(Dami.publicDir.path));
      }
      else {
        app.use(express.static(Dami.publicDir.path));
      }
    }

    app.use(track.start);
    if (initRun) {
      initRun(app)
    }
    const beforeRequest = Dami.config[Cattr.BEFORE_REQUEST]
    if (!isEmpty(beforeRequest)) {
      app.use(beforeRequest);
    }

    if (this.controllers == null) {
      throw new Error(`Controllers 'controllers' not configured`);
    }
    const controllers = this.getControllers(this.controllers);
    for (const contr of controllers) {
      const [control, controller] = contr
      const router = express.Router();
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

      /**
       * after action
       */
      for (const aa of controller.afterAction()) {
        const middle = new aa(controller);
        app.use(`/${control}`, middle.run);
      }
    }

    /**
     * this is where dami auto code generator is register
     */
    if (!Dami.config[Cattr.PRODUCTION]) {
      if (Object.keys(Dami.dbConfig).length === 0) {
        app.use(`/${Cattr.APP_NAME}`, (req, res, next) => {
          if (Object.keys(Dami.dbConfig).length === 0) {
            res.status(HttpCode.BAD_GATEWAY).send("Database with 'dbConfig' not configured").end();
          }
          else {
            next();
          }
        });
      } else {
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
        app.use(`/${Cattr.APP_NAME}`, express.static(__dirname + "/../migration/resource/client"));
      }
    }

    const afterRequest = Dami.config[Cattr.AFTER_REQUEST]
    if (!isEmpty(afterRequest)) {
      app.use(afterRequest);
    }
    const sr = Dami.config[DamiConfigure.SERVER_RENDER];
    if (sr) {
      app.use(async (req, res, next) => {
        if (!res.headersSent) {
          let currentPage = <IServerRender>{};
          if (Array.isArray(sr)) {
            let brk = false;
            sr.forEach(e => {
              if (brk) return false
              const path = req.path
              if (!path.startsWith(e.path)) {
                return false;
              }
              currentPage = { ...e }
              brk = true
            })
            if (!brk) return next()
          } else {
            currentPage = sr
          }
          if (!this.getServerResponse(req, res, currentPage.page)) {
            next()
          }
        } else {
          next()
        }
      });
    }
    app.use(track.memory);
    app.use(track.time);
    app.use(track.end);
    app.listen(Dami.port, () => console.log(`Your app listening on port ${Dami.port}!`));
  };

  private getServerResponse(req, res, page) {
    const file = Dami.getCurrentPath() + '/' + page;
    if (!_fs.existsSync(file)) {
      return false
    }
    _fs.readFile(file, (err, data) => {
      let _srdata = data.toString("utf-8")
      const title = res.title;
      console.log(res.title)
      if (title) {
        const _ctitle = `<title>${title}</title>`;
        _srdata = _srdata.replace("{{title}}", _ctitle)
      }
      if (!isEmpty(res.meta)) {
        const _cmeta = res.meta.map(m => {
          const _m = Object.keys(m).map(a => {
            return `${a}="${m[a]}"`
          }).join(" ")
          return `<meta ${_m}/>`
        }).join("\n")
        _srdata = _srdata.replace("{{meta}}", _cmeta)
      }
      res.setHeader("Content-Type", "text/html")
      res.status(HttpCode.OK).send(_srdata).end()
    })
    return true
  }
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
