import * as jwt from 'jsonwebtoken';
import Dami from '../app/Dami';

export interface IUserToken {
  authkey: string;
  name: string;
}

// export class UserToken {
//   static getToken(user: IUserToken): string {
//     return jwt.sign(user, (Dami.loginUser.authToken ? Dami.loginUser.authToken : Dami.loginUser[0].authToken), {
//       algorithm: 'HS256',
//       expiresIn: Dami.loginUser.authExpire ? Dami.loginUser.authExpire : Dami.loginUser[0].authExpire,
//     });
//   }
// }
