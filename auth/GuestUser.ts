import { _IUserConfig } from '../config/IConfig';
// import ActiveRecords from '../models/ActiveRecord';
import IAuth from './IAuth';

class GuestUser implements IAuth {
  username: string;
  rules = () => {
    return {
      "username": ["string"]
    }
  }

  signToken: () => string;
  getRefreshToken: () => string;
  validatePassword: (password: string) => boolean;
  hashPassword: (passowrd: string) => string;
  validateToken: (token: string) => boolean;
  getAuthKey: () => string;
  findUser: (username: string) => any;
  findById: (id: number) => any;
  findByAuthKey: (token: string) => any;
  getConfig: () => _IUserConfig;
}

export default GuestUser;
