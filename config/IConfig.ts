import IMiddleWare from "../app/IMiddleWare";
import IAuth from "../auth/IAuth";
import IController from "../controllers/IController";

export interface IDatabase {
    connectionLimit?: number,
    host: string,
    user: string,
    password: string,
    database: string
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
export interface IPubdirConfig {
    from?: string
    path: string
}

interface IRbacFunc {
    (user: IAuth, path: string): boolean;
}

interface IActionFunc {
    (): IMiddleWare[];
}

interface IRequiredLoginFunc {
    (): boolean | string[]
}

export interface IDamiConfig {
    port: number
    controllers: IController
    baseUrl: string
    loginUser?: IUserAuthList | IUserAuth
    publicDir?: IPubdirConfig
    basePath?: string
    path?: object
    initAction?: Function
    requiredLogin?: IRequiredLoginFunc
    beforeAction?: IActionFunc
    afterAction?: IActionFunc
    rbac?: IRbacFunc
    dbConfig?: IDatabase
    enableRbac?: boolean
    services?: Array<any>
}