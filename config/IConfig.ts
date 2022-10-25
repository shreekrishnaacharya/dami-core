import { NextFunction, Request, Response } from "express";
import IMiddleWare from "../app/IMiddleWare";
import IAuth from "../auth/IAuth";
import IController from "../controllers/IController";

export interface IDatabase {
    connectionLimit?: number,
    host: string,
    user: string,
    password: string,
    database: string,
    dummy?: boolean
}
export interface IUserAuth {
    authUser: any;
}
export interface _IUserConfig {
    uniqueSession: boolean;
    authSalt: string;
    authExpire: number;
    refreshSalt: string;
    refreshExpire: string;
    refreshInactive: number;
}
export interface IUserAuthList {
    [key: string]: IUserAuth
}

export interface IControllerList {
    [key: string]: IController | IControllerList
}

export interface IPubdirConfig {
    from?: string
    path: string
}

export interface IRbacFunc {
    (user: IAuth, path: string): boolean;
}

export interface IMiddleAction {
    (): any[];
}

export interface IActionFunc {
    (request: Request, response: Response, next: NextFunction): void;
}

export interface IRequiredLoginFunc {
    (): boolean | string[]
}

export interface IDamiList {
    [key: string]: object
}


export interface IServerRender {
    path: string
    has: boolean
    page: string
}


export interface IDamiConfig {
    appName: string,
    production: boolean
    port: number
    controllers: IControllerList | null
    baseUrl: string
    viewEngine?: string,
    damiList?: IDamiList
    loginUser?: IUserAuthList | IUserAuth
    publicDir?: IPubdirConfig
    basePath?: string
    resourcePath?: string
    path?: object
    initAction?: Function
    requiredLogin?: IRequiredLoginFunc
    beforeAction?: IMiddleAction
    afterAction?: IMiddleAction
    beforeRequest?: IActionFunc
    afterRequest?: IActionFunc
    rbac?: IRbacFunc
    dbConfig?: IDatabase
    enableRbac?: boolean
    services?: Array<any>
    serverRender?: IServerRender | IServerRender[]
}