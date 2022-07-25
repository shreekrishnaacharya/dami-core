import { NextFunction, Request, Response } from 'express';
import Controller from '../../controllers/Controller';
import Methods from '../../controllers/Methods';
import HttpCode from '../../helpers/HttpCode';
import ReadCrud from '../Helper/ReadCrud';
import TestSpecialChar from '../Helper/SpecialCharacter';

class CrudController extends Controller<any> {
  constructor() {
    super('');
  }

  previewCrud = async (req: Request, res: Response, next: NextFunction) => {
    const { c_name, c_path, model_path, is_mini } = req.body;
    if (c_name === undefined || c_path === undefined || model_path === undefined) {
      res.status(HttpCode.BAD_REQUEST).send();
      return next();
    }
    if (
      TestSpecialChar(c_name) ||
      TestSpecialChar(c_path.replace(/\\/g, '__a__').replace('@', '')) ||
      TestSpecialChar(model_path.replace(/\\/g, '__a__').replace('@', ''))
    ) {
      res.status(HttpCode.BAD_REQUEST).send();
      return next();
    }
    const readSchema = new ReadCrud();
    const result = readSchema.preview(c_name, c_path, model_path, is_mini);
    if (result === false) {
      res.status(HttpCode.BAD_REQUEST).send(readSchema.getError());
      return next();
    }
    res.send([result]);
    return next();
  };
  codeCrud = async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    if (code === undefined) {
      res.status(HttpCode.BAD_REQUEST).send();
      return next();
    }
    const readSchema = new ReadCrud();
    const result = await readSchema.create(code, false);
    res.send(result);
    return next();
  };
  createCrud = async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    if (code === undefined) {
      res.status(HttpCode.BAD_REQUEST).send();
      return next();
    }
    const readSchema = new ReadCrud();
    const result = await readSchema.create(code, true);
    res.send(result);
    return next();
  };

  route = () => {
    return [
      { method: Methods.POST, path: '/preview', action: 'previewCrud' },
      { method: Methods.POST, path: '/code', action: 'codeCrud' },
      { method: Methods.POST, path: '/create', action: 'createCrud' },
    ];
  };
}
export default CrudController;
