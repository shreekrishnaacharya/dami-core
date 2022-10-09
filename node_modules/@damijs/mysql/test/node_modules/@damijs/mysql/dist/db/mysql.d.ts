import { IDatabase } from '../config/IConfig';
declare type SqlQuery = [string, Array<string | number>];
declare class Mysql {
    private con;
    private connection;
    private hasTransaction;
    constructor(dbConfig: IDatabase);
    /**
     *
     * @param query
     * @param values
     * @returns
     */
    format(query: string, values: Array<string | number>): string;
    /**
     *
     * @param sqlQuery
     * @param callback
     * @returns
     */
    query(sqlQuery: string | SqlQuery, callback?: (error: Error, result: Array<any>) => void): Promise<Array<object>>;
    /**
     *
     * @param sqlQuery
     * @param callback
     * @returns
     */
    queryOne(sqlQuery: string | SqlQuery, callback?: (error: Error, result: Array<any>) => void): Promise<JSON | null>;
    /**
     *
     * @param sqlQuery
     * @param callback
     * @returns
     */
    execute(sqlQuery: SqlQuery | string, callback?: any): Promise<any>;
    /**
     *
     * @param sql
     * @param records
     * @param callback
     * @returns
     */
    insert(sql: string, records: any, callback?: any): Promise<any>;
    /**
     * begin transaction
     * @param hasTransaction
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
    beginTransaction(hasTransaction?: boolean): Promise<any>;
    /**
     * Commit transaction
     * @returns
     */
    commit(): Promise<unknown>;
    /**
     * Rollback the transaction
     * @returns
     */
    rollBack(): Promise<unknown>;
}
export default Mysql;
