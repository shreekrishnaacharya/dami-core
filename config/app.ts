import IMiddleWare from '../app/IMiddleWare';
import GuestUser from '../auth/GuestUser';


const appConfig = {
  port: 3000,
  loginUser: {
    authToken: 'ASnd$j12sa@kaKJQ32WkASn232Ajhw1123ASsak32',
    uniqueSession: true,
    authUser: GuestUser,
    authExpire: 3000, // in seconds
    refreshToken: 'ASnd$j12sa@kaKJQ32WkASn232Ajhw1123ASsak32',
    refreshExpire: '1y',
    refreshInactive: 0,
  },
  baseUrl: '',
  basePath: 'storage',
  path: {},
  requiredLogin: (): boolean | string[] => {
    return false;
  },
  beforeAction: (): IMiddleWare[] => {
    return [];
  },
  afterAction: (): IMiddleWare[] => {
    return [];
  },
  rbac: (userModel, path): boolean => {
    return true;
  },
  db: {} as IDatabase,
  enableRbac: false,
  controllers: null,
  services: [],
};
export default appConfig;
