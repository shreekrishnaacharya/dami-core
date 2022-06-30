import IAuth from '../auth/IAuth';
import { IRoute } from './Route';

export default interface IController {
  route: () => IRoute[];
  rbac: (userModel: IAuth, route: string) => boolean;
}
