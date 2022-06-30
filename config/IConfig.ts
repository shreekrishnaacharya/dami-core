interface IDatabase {
    connectionLimit?: number,
    host: string,
    user: string,
    password: string,
    database: string
}
interface IUserConfig {
    authUser: any;
    uniqueSession: boolean;
    authToken: string;
    authExpire: number;
    refreshToken: string;
    refreshExpire: string;
    refreshInactive: 0;
}