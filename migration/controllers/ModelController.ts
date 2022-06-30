import { NextFunction, Request, Response } from 'express';
import Controller from '../../controllers/Controller';
import Methods from '../../controllers/Methods';
import HttpCode from '../../helpers/HttpCode';
import { Connection } from '../../models/Connection';
import ReadSchema from '../Helper/ReadSchema';
import TestSpecialChar from '../Helper/SpecialCharacter';
import MigType from '../config/const';

class ModelController extends Controller<any> {
  constructor() {
    super('');
  }
  tables = async (req: Request, res: Response, next: NextFunction) => {
    const result = await Connection.mysql
      .query('SHOW TABLES')
      .then((e: object[]) => {
        if (e.length > 0) {
          const ef = e.map((e2) => {
            const val = Object.values(e2)[0];
            return {
              id: val,
              label: val,
            };
          });
          return ef.filter((tn: object) => {
            return !tn[MigType.LABEL].includes(MigType.NAME);
          });
        }
        /* tslint:disable:no-empty */
        return [];
      })
      .catch((e) => {
        return 42000;
      });
    if (result === 42000) {
      res.sendStatus(HttpCode.METHOD_NOT_ALLOWED);
    } else {
      res.send(result);
    }

    next();
  };
  previewModel = async (req: Request, res: Response, next: NextFunction) => {
    const { table_name, model_name, model_path } = req.body;
    if (table_name === undefined || model_name === undefined || model_path === undefined) {
      res.status(HttpCode.BAD_REQUEST).send();
      return next();
    }
    if (
      TestSpecialChar(table_name) ||
      TestSpecialChar(model_name) ||
      TestSpecialChar(model_path.replace(/\\/g, '__a__').replace('@', ''))
    ) {
      res.status(HttpCode.BAD_REQUEST).send();
      return next();
    }
    const readSchema = new ReadSchema();
    const result = await readSchema.preview(model_name, table_name, model_path);
    if (result === false) {
      res.status(HttpCode.BAD_REQUEST).send(readSchema.getError());
      return next();
    }
    res.send([result]);
    return next();
  };
  codeModel = async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    if (code === undefined) {
      res.status(HttpCode.BAD_REQUEST).send();
      return next();
    }
    const readSchema = new ReadSchema();
    const result = await readSchema.create(code, false);
    res.send(result);
    return next();
  };
  createModel = async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    if (code === undefined) {
      res.status(HttpCode.BAD_REQUEST).send();
      return next();
    }
    const readSchema = new ReadSchema();
    const result = await readSchema.create(code, true);
    res.send(result);
    return next();
  };

  route = () => {
    return [
      { method: Methods.GET, path: '/table', action: 'tables' },
      { method: Methods.POST, path: '/preview', action: 'previewModel' },
      { method: Methods.POST, path: '/code', action: 'codeModel' },
      { method: Methods.POST, path: '/create', action: 'createModel' },
    ];
  };
}
export default ModelController;
