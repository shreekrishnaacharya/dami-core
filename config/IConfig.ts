export interface IDatabase {
    connectionLimit?: number,
    host: string,
    user: string,
    password: string,
    database: string
}

export interface IUserConfig {
    authUser: any;
    uniqueSession: boolean;
    authSalt: string;
    authExpire: number;
    refreshSalt: string;
    refreshExpire: string;
    refreshInactive: number;
}
export interface _IUserConfig {
    uniqueSession: boolean;
    authSalt: string;
    authExpire: number;
    refreshSalt: string;
    refreshExpire: string;
    refreshInactive: number;
}
export interface IUserConfigList {
    [key: string]: IUserConfig
}
export interface IPubdirConfig {
    from?: string
    path: string
}