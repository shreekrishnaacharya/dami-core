import * as jwt from 'jsonwebtoken';
import Dami from '../app/Dami';

export interface IUserToken {
  authkey: string;
  name: string;
}

export class UserToken {
  static getToken(user: IUserToken): string {
    return jwt.sign(user, Dami.loginUser.authToken, {
      algorithm: 'HS256',
      expiresIn: Dami.loginUser.authExpire,
    });
  }
}
