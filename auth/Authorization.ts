import Dami from '../app/Dami';
import MiddleWare from '../app/MiddleWare';
import BaseController from '../controllers/BaseController';
import IMiddleWare from '../app/IMiddleWare';
import HttpCode from '../helpers/HttpCode';
import HttpHead from '../helpers/HttpHead';
class Authorization extends MiddleWare implements IMiddleWare {
  controller: BaseController<any>;
  constructor(controller: BaseController<any>) {
    super();
    this.controller = controller;
  }
  run = (req, res, next) => {
    return this.auth(req, res, next);
  };

  protected auth = async (req, res, next) => {
    const guardActions: string[] | boolean = this.controller.requiredLogin();
    let userModel = null;
    if ("authUser" in Dami.loginUser) {
      userModel = new Dami.loginUser.authUser();
    } else {
      const cpath = this.controller.getPath();
      let kpath = null;
      Object.keys(Dami.loginUser).forEach(e => {
        if (cpath.startsWith(e)) {
          kpath = e
        }
      });
      if (kpath != null) {
        userModel = new Dami.loginUser[kpath].authUser()
      }
    }
    console.log(guardActions, "ga")
    /**  
     * check if we need to protect the action form access.
     * if not let user visit action
     */
    if (typeof guardActions === 'boolean') {
      if (!guardActions) {
        return next();
      } else if (userModel == null) {
        return res.status(HttpCode.UNAUTHORIZED).send('Login required :1001').end();
      }
    } else {
      const action = this.controller.getActionName(req);
      // check if action exists
      if (action === null) {
        return next();
      }
      if (guardActions.indexOf(action) < 0) {
        return next();
      }
    }

    /**
     * check if current action required login
     */
    const bearerHeader = req.headers[HttpHead.AUTHORIZATION];
    if (typeof bearerHeader === 'undefined') {
      // when token is not set on header
      return res.status(HttpCode.UNAUTHORIZED).send('Login required :1002').end();
    }
    // get token by spliting bearer and token
    const bearerToken = bearerHeader.split(' ')[1];
    // decode the token to verify user
    if (!userModel.validateToken(bearerToken)) {
      return res.status(HttpCode.UNAUTHORIZED).send('Login required :1003').end();
    }
    const jwtJson = Dami.parseJwt(bearerHeader);
    // find user by token
    /* tslint:disable:no-string-literal */
    const model = await userModel.findByAuthKey(jwtJson['authkey']);
    if (model === null) {
      // if user not found
      return res.status(HttpCode.UNAUTHORIZED).send('Login required :1004').end();
    }
    // set auth-token
    // res.headers["auth-token"] = bearerToken;
    console.log(model, 'user')
    req.user = model;
    req.authToken = bearerHeader;
    req.authJson = jwtJson;
    if (this.controller.runRbac(userModel, req.originalUrl)) {
      return next();
    }
    return res.status(HttpCode.FORBIDDEN).send('Forbidden').end();
  };
}

export default Authorization;
