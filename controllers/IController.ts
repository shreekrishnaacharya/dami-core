import { Request } from 'express';
import IAuth from '../auth/IAuth';
import { IRoute } from './Route';

export default interface IController {
  route: () => IRoute[];
  getPath: () => string
  requiredLogin: () => boolean | string[]
  getActionName: (req: Request) => string
  rbac: (userModel: IAuth, route: string) => boolean;
  runRbac(user: IAuth, route: string): boolean
}
