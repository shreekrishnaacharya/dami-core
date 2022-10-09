import { IDatabase } from '../config/IConfig';
import Mysql from '../db/mysql';
import BaseModel from './BaseModel';
/**
 *
 *
 * @export
 * @enum {number}
 */
export declare enum Query {
    INSERT = "INSERT",
    SELECT = "SELECT",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    EXECUTE = "EXECUTE"
}
/**
 *
 *
 * @abstract
 * @class Connection
 * @extends {BaseModel}
 */
declare abstract class Connection extends BaseModel {
    private queryString;
    protected queryType: string;
    private db;
    static config: IDatabase;
    constructor();
    /**
     * function to be called after the result are available
     * @param err | error
     * @param res | result data
     */
    protected callback: (err: Error, res: object) => void;
    /**
     * setup query string to be processed
     * @param query | query string
     * @returns | current model
     */
    protected createCommand(query: string): this;
    /**
     * execute the query
     * @returns
     */
    protected execute(): Promise<any>;
    /**
     * delete query
     * @returns
     */
    protected rawDelete(): Promise<any>;
    /**
     * update query
     * @returns
     */
    protected rawUpdate(): Promise<any>;
    /**
     * bulk insert
     * @param records
     * @returns
     */
    protected bulkInsert(records: any[]): Promise<any>;
    /**
     * raw insert
     * @param records
     * @returns
     */
    protected rawInsert(records: any[]): Promise<any>;
    /**
     * query all
     * @returns
     */
    protected queryAll(): Promise<object[]>;
    /**
     * query one
     * @returns
     */
    protected queryOne(): Promise<object[]>;
    /**
     * query
     * @returns
     */
    protected query(): Promise<object[]>;
    /**
     * raw query
     * @param query
     * @returns
     */
    protected rawQuery(query: string): Promise<object[]>;
    /**
     * @returns Mysql
     */
    protected getDb(): Mysql;
    /**
     * bind transaction
     * this will bind multiple model's db
     * operation into same connection for
     * transaction operation
     * eg:
     * const model=new Customer();
     * const transaction=model.beginTransaction();
     * const contact=new Contact();
     * contact.bindTransaction(transaction);
     *
     * here customer and contact are
     * bind into same connection stream
     * to perform single transaction
     * @returns Mysql
     */
    bindTransaction(db: Mysql): Mysql;
    /**
     * begin transaction
     * @returns Mysql
     *
     * eg:
     * const model=new Customer();
     * if(model.load(req.body)){
     * const transaction=model.beginTransaction();
     * let flag=true;
     *  try{
     *      if(await model.save()){
     *          for(const address in req.addresses){
     *            const contact=new Contact();
     *            contact.bindTransaction(transaction);
     *            contact.load(req.body)
     *            contact.setValue('fk_customer_id',model.id);
     *            if(!await contact.save()){
     *              flag=false;
     *            }
     *          }
     *          if(flag){
     *            transaction.commit()
     *            res.sendStatus(HttpCode.ACCEPTED);
     *            return next();
     *          }
     *        }
     *        res.sendStatus(HttpCode.BAD_REQUEST);
     *   }catch(e=>{
     *        res.status(HttpCode.INTERNAL_SERVER_ERROR).send({});
     *   })
     *    transaction.rollBack();
     *  }else{
     *    res.sendStatus(HttpCode.BAD_REQUEST);
     *  }
     * next();
     * }
     *
     */
    beginTransaction(): Promise<Mysql>;
}
export { Connection };
