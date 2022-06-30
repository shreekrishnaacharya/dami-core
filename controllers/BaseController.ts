import { IRoute } from './Route';
import Dami from '../app/Dami';
import MiddleWare from '../app/MiddleWare';
import '../customs/custom';
import { PathMatch } from '../helpers/PathMatch';
import ActiveRecords from '../models/ActiveRecord';
import IController from './IController';
import IAuth from '../auth/IAuth';
abstract class BaseController<Model> implements IController {
  private model: any;
  protected appConfigobject;
  protected path: string;

  constructor(model?: any) {
    this.model = model;
  }
  // path to current controller
  setPath(path: string) {
    this.path = path;
  }

  /*
        @Route function
        this function holds the defination for routes for actions in controllers
        ----------------------------
        It is array of object that has 3 values as method, path, action
        method : it type of Methods which id one of get,post,put,delete
        path : url path to the action
        action : name of method to execute
    */
  route = (): IRoute[] => {
    return [];
  };

  getModel(): Model {
    if (this.model === undefined) {
      throw new Error('Active Model not set');
    }
    return new this.model();
  }

  getModelExtend<M extends ActiveRecords>(): M {
    if (this.model === undefined) {
      throw new Error('Active Model not set');
    }
    return new this.model();
  }

  hasModel(): boolean {
    if (this.model === undefined) {
      return false;
    }
    return true;
  }

  rbac = (userModel: IAuth, route: string) => {
    return Dami.rbac(userModel, route);
  };

  runRbac(userModel: IAuth, route: string) {
    return this.rbac(userModel, route);
  }

  // list action that required login
  requiredLogin = (): boolean | string[] => {
    return Dami.requiredLogin();
  };

  // method that get current action name
  getActionName(req) {
    const urloriginal = req.originalUrl.replace(req._parsedUrl.search, '');
    for (const rout of this.route()) {
      if (rout.method === req.method.toLowerCase() && PathMatch(this.path + rout.path, urloriginal)) {
        return rout.action;
      }
    }
    return null;
  }

  // list of middleware that run before any action
  beforeAction = (): MiddleWare[] => {
    return Dami.beforeAction();
  };

  // list of middleware that run after action
  afterAction = (): MiddleWare[] => {
    return Dami.afterAction();
  };
}

export default BaseController;
