// import IActiveModel from "../models/IActiveModel";
/* tslint:disable:no-namespace */
declare namespace Express {
  export interface Request {
    user?: any;
    authToken?: any;
    authJson?: any;
    // files?: any
  }
}
