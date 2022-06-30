interface IAuth {
  validatePassword: (password: string) => boolean;
  hashPassword: (passowrd: string) => string;
  validateToken: (token: string) => boolean;
  getAuthKey: () => string;
  findUser: (username: string) => any;
  findById: (id: number) => any;
  signToken: (refreshToken: string) => string;
  refreshToken: () => string;
  findByAuthKey: (authkey: string) => any;
}

export default IAuth;
