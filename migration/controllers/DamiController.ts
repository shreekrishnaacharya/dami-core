import { NextFunction, Request, Response } from 'express';
import Controller from '../../controllers/Controller';
import Methods from '../../controllers/Methods';
import * as _path from "path"
import ReadFile from '../Helper/ReadFile';

class DamiController extends Controller<any> {
  constructor() {
    super('');
  }

  index = async (req: Request, res: Response, next: NextFunction) => {
    res.send(ReadFile.index());
    return next();
  };

  static = async (req: Request, res: Response, next: NextFunction) => {
    const { type, name } = req.params;
    const response = ReadFile.readPath(type, name);
    res.sendFile(response);
  };

  route = () => {
    return [
      { method: Methods.GET, path: '/', action: 'index' },
      { method: Methods.GET, path: '/static/:type/:name', action: 'static' },
    ];
  };
}

export default DamiController;
