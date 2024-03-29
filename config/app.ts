import GuestUser from '../auth/GuestUser';
import { IDamiConfig, IDatabase, IMiddleAction, IPubdirConfig } from './IConfig';

const appConfig: IDamiConfig = {
  appName: "Dami App",
  production: false,
  port: 3000,
  loginUser: {
    authUser: GuestUser,
  },
  publicDir: { path: 'public' } as IPubdirConfig,
  baseUrl: '',
  basePath: 'storage',
  path: {},
  initAction: (): void => {

  },
  requiredLogin: (): boolean | string[] => {
    return false;
  },
  beforeAction: (): IMiddleAction[] => {
    return [];
  },
  afterAction: (): IMiddleAction[] => {
    return [];
  },
  rbac: (userModel, path): boolean => {
    return true;
  },
  dbConfig: {} as IDatabase,
  enableRbac: false,
  controllers: null,
  services: [],
};
export default appConfig;
