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

export interface IActionFunc {
    (): any[];
}

export interface IRequiredLoginFunc {
    (): boolean | string[]
}

export interface IDamiList {
    [key: string]: object
}

export interface IDamiConfig {
    production: boolean
    port: number
    controllers: IControllerList
    baseUrl: string
    viewEngine?: string,
    damiList?: IDamiList
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