import QueryBuild from './QueryBuild';
import { Connection } from './Connection';
import ListModel from '../helpers/ListModel';
/**
 *
 *
 * @class ActiveQuery
 * @extends {Connection}
 */
declare class ActiveQuery extends Connection {
    private isAll;
    joinOne: any[];
    joinMany: any[];
    private _glueQuery;
    ['constructor']: any;
    constructor();
    onResult(callback: (e: any) => void): this;
    onError(callback: (e: any) => void): this;
    /**
     * Insert multiple rows into table
     * @param columns : column list
     * @param record : respective row values
     * @returns boolean : true if success, false if failed
     */
    insertAll(columns: string[], record: any[][]): Promise<boolean>;
    /**
     *
     *
     * @param {object} [condition]
     * @return {*}  {Promise<boolean>}
     * @memberof ActiveQuery
     */
    deleteAll(condition?: object): Promise<boolean>;
    /**
     *
     *
     * @param {object} record
     * @param {object} [condition]
     * @return {*}  {Promise<boolean>}
     * @memberof ActiveQuery
     */
    updateAll(record: object, condition?: object): Promise<boolean>;
    /**
     * Insert the loaded data of model into table
     * @param validate : validate attributes before save or not - default true
     * @returns : true on success and false on failed
     */
    save(validate?: boolean): Promise<boolean>;
    /**
     * delete the data of provided id
     * @param id : id of row to be deleted
     * @returns : true on success and false on failed
     */
    delete(id: number | string): Promise<boolean>;
    /**
     * update the current loaded data into provided id
     * @param id : id of row to be updated
     * @returns : true on success and false on failed
     */
    update(id: number | string): Promise<boolean>;
    /**
     * find one model for given id
     * @param id : id to find the row
     * @returns : if not found returns null else model
     */
    findOne(id: number | string): Promise<this | null>;
    /**
     * find the model based on callback QueryBuild
     * @param callback : Callback function with argument type "QueryBuild"
     * @returns : current model
     */
    find(callback?: (e: QueryBuild) => QueryBuild): this;
    /**
     * get one model
     * @returns : if not found returns null else model
     */
    one(): Promise<this | null>;
    /**
     * get list of model
     * @returns array of model or ListModel of model
     */
    all(): Promise<ListModel<this | any>>;
    /**
     * get list of model
     * @returns array of model or ListModel of model
     */
    findAll(): Promise<ListModel<this | any>>;
    /**
     *
     * @param result : list of model
     * @returns :list of model with glued attribute(s)
     */
    private getGlueBuild;
    /**
     * get QueryBuild of current model
     * @returns : QueryBuild
     */
    getBuild(): QueryBuild;
    /**
     *
     * @param build : query build
     */
    setBuild(build: QueryBuild): this;
    /**
     * set return type, either as model or json object
     * @param flag : true for object, false for model
     * @returns : current model
     */
    asObject(flag?: boolean): this;
    /**
     * set return type, either as model or json object
     * @param flag : true for model, false for json object
     * @returns : current model
     */
    asModel(flag?: boolean): this;
    /**
     * setup join table on foreign key
     * @param table : model of table to join
     * @param condition : condition to join table on
     * @param name : attribute where join model will be available
     * @returns : current model
     */
    protected hasOne(table: any, condition: object, name: string): this;
    /**
     * force join table
     * @param fun : function that will have logic to build QueryBuild and return
     * @param name : attribute where join model will be available
     * @returns : current model
     */
    protected glueQuery(fun: Function, name: string): this;
    /**
     * setup join on child table for many
     * @param table : model of table to join
     * @param condition : condition to join table on
     * @param name : attribute where join model will be available
     * @returns : current model
     */
    protected hasMany(table: any, condition: object | Function, name: string): this;
    /**
     *
     *
     * @private
     * @param {Promise<any>} promise
     * @return {*}
     * @memberof ActiveQuery
     */
    private pPromise;
    /**
     *
     *
     * @private
     * @param {*} result
     * @return {*}
     * @memberof ActiveQuery
     */
    private getAtt;
    /**
     *
     *
     * @private
     * @param {string} query
     * @return {*}
     * @memberof ActiveQuery
     */
    private validateGlue;
}
export default ActiveQuery;
