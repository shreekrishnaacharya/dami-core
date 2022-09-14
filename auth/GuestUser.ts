import { _IUserConfig } from '../config/IConfig';
import ActiveRecords from '../models/ActiveRecord';
import IAuth from './IAuth';

class GuestUser extends ActiveRecords implements IAuth {
  username: string;
  constructor() {
    super('');
    this.load({ username: 'Guest User' });
  }

  rules = () => {
    return {
      "username": ["string"]
    }
  }

  signToken: () => string;
  refreshToken: () => string;
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
