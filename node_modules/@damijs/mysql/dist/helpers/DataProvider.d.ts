import IActiveModel from '../models/IActiveModel';
import QueryBuild from '../models/QueryBuild';
interface Request {
    [key: string]: any;
}
interface Response {
    [key: string]: any;
}
interface DpConfig {
    request: Request;
    response: Response;
    sort?: object;
    size?: number;
    page?: number;
}
export default class DataProvider {
    private model;
    private queryModel;
    private sortBy;
    private totalCount;
    private page;
    private pageOffset;
    private pageSize;
    private attributes;
    private config;
    private request;
    private response;
    private DEFAULT_PAGE_SIZE;
    constructor(config: DpConfig);
    setModel(model: IActiveModel): this;
    load(query: object, reset?: boolean): void;
    getList(): Promise<any>;
    query(callback: (query: QueryBuild) => QueryBuild): this;
    private getload;
}
export {};
