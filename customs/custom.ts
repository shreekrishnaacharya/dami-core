
/* tslint:disable:no-namespace */
declare namespace Express {
  export interface Request {
    user?: any
    authToken?: any
    authJson?: any
    files?: any
  }
  export interface Response {
    meta?: object[],
    title?: string
  }
}
