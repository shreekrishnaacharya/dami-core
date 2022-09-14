import { _IUserConfig } from "../config/IConfig";

interface IAuth {
  validatePassword: (password: string) => boolean;
  hashPassword: (passowrd: string) => string;
  validateToken: (token: string) => boolean;
  getAuthKey: () => string;
  findUser: (username: string) => Promise<any>;
  findById: (id: number) => Promise<any>;
  signToken: (refreshToken: string) => string;
  refreshToken: () => string;
  findByAuthKey: (authkey: string) => Promise<any>;
  getConfig: () => _IUserConfig
}

export default IAuth;
