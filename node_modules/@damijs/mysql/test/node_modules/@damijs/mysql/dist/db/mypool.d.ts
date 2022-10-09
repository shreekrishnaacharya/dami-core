import { IDatabase } from '../config/IConfig';
declare class MyPool {
    private dbname;
    constructor(dbConfig: IDatabase);
    getConnection(funct: (err: Error, connection: any) => void): void;
    query(sql: string, func: (err: Error, resullt: any) => void): void;
    release(): void;
}
export default MyPool;
