import { NextFunction, Request, Response } from 'express';
import { RoleAction, Role } from '../models';
import Controller from '../../controllers/Controller';
import Methods from '../../controllers/Methods';
import HttpCode from '../../helpers/HttpCode';
import ReadRbac from '../Helper/ReadRbac';

class RbacController extends Controller<any> {
  constructor() {
    super();
  }

  init = async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body;
    let result = false;
    if (type === 'check') {
      result = await ReadRbac.checkInit();
    } else {
      result = await ReadRbac.redo();
    }
    if (result) {
      res.send('Success');
    } else {
      res.sendStatus(HttpCode.CONFLICT);
    }
    return next();
  };
  listRole = async (req: Request, res: Response, next: NextFunction) => {
    const model = new Role();
    try {
      const result = await model.asModel().findAll();
      res.send(await result.toJson());
    } catch (err) {
      res.status(HttpCode.INTERNAL_SERVER_ERROR).send({});
    }
    next();
  };

  viewRole = async (req: Request, res: Response, next: NextFunction) => {
    const model = new Role();
    try {
      await model.findOne(req.params.id); // if empty it will return null else it will return a model with data
      if (model.isEmpty) {
        res.status(HttpCode.NOT_FOUND).end();
      } else {
        res.send(model.toJson());
      }
    } catch (err) {
      // console.log(err);
      res.sendStatus(HttpCode.INTERNAL_SERVER_ERROR);
    }
    next();
  };

  addRole = async (req: Request, res: Response, next: NextFunction) => {
    const model = new Role();
    try {
      if (model.load(req.body)) {
        if (await model.save()) {
          res.status(HttpCode.ACCEPTED).send(model.toJson()); // return 204 on success
        } else {
          res.status(HttpCode.UNPROCESSABLE_ENTITY).send({}); // return unprocessable status
        }
      } else {
        res.status(HttpCode.BAD_REQUEST).send({});
      }
    } catch (err) {
      res.status(HttpCode.INTERNAL_SERVER_ERROR).send({});
    }
    next();
  };

  updateRole = async (req: Request, res: Response, next: NextFunction) => {
    const model = new Role();
    try {
      if (model.load(req.body)) {
        if (await model.update(req.params.id)) {
          res.status(HttpCode.ACCEPTED).send({}); // return 204 on success
        } else {
          res.status(HttpCode.UNPROCESSABLE_ENTITY).send({}); // return unprocessable status
        }
      } else {
        res.status(HttpCode.BAD_REQUEST).send({});
      }
    } catch (err) {
      res.status(HttpCode.INTERNAL_SERVER_ERROR).send({});
    }
    next();
  };

  listAction = async (req: Request, res: Response, next: NextFunction) => {
    const model = new RoleAction();
    try {
      const result = await model.getActionsByRole(req.params.id);
      res.send(result);
    } catch (err) {
      res.status(HttpCode.INTERNAL_SERVER_ERROR).send({});
    }
    next();
  };

  updateAction = async (req: Request, res: Response, next: NextFunction) => {
    const model = new RoleAction();
    try {
      await model.findOne(req.params.id); // if empty it will return null else it will return a model with data
      if (model.isEmpty) {
        res.status(HttpCode.NOT_FOUND).end();
      } else {
        model.load({ status: model.getValue('status') === 1 ? 0 : 1 });
        if (await model.update(req.params.id)) {
          res.status(HttpCode.ACCEPTED).send({}); // return HttpCode.ACCEPTED on success
        } else {
          res.status(HttpCode.UNPROCESSABLE_ENTITY).send({}); // return unprocessable status
        }
      }
    } catch (err) {
      res.status(HttpCode.INTERNAL_SERVER_ERROR).send({});
    }
    next();
  };

  route = () => {
    return [
      { method: Methods.GET, path: '/init', action: 'init' },
      { method: Methods.GET, path: '/role', action: 'listRole' },
      { method: Methods.GET, path: '/role/:id', action: 'viewRole' },
      { method: Methods.POST, path: '/role/:id', action: 'addRole' },
      { method: Methods.PUT, path: '/role/:id', action: 'updateRole' },
      { method: Methods.GET, path: '/action/:id', action: 'listAction' },
      { method: Methods.PUT, path: '/action/:id', action: 'updateAction' },
    ];
  };
}

export default RbacController;
