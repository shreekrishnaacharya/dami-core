var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Mysql from '../db/mysql';
import BaseModel from './BaseModel';
/**
 *
 *
 * @export
 * @enum {number}
 */
export var Query;
(function (Query) {
    Query["INSERT"] = "INSERT";
    Query["SELECT"] = "SELECT";
    Query["UPDATE"] = "UPDATE";
    Query["DELETE"] = "DELETE";
    Query["EXECUTE"] = "EXECUTE";
})(Query || (Query = {}));
/**
 *
 *
 * @abstract
 * @class Connection
 * @extends {BaseModel}
 */
class Connection extends BaseModel {
    constructor() {
        super();
        /**
         * function to be called after the result are available
         * @param err | error
         * @param res | result data
         */
        this.callback = (err, res) => {
            if (err) {
                this.errorCallback(err);
            }
            else {
                this.successCallback(res);
            }
        };
        this.queryString = '';
        this.queryType = '';
    }
    /**
     * setup query string to be processed
     * @param query | query string
     * @returns | current model
     */
    createCommand(query) {
        this.queryString = query;
        return this;
    }
    /**
     * execute the query
     * @returns
     */
    execute() {
        this.queryType = Query.EXECUTE;
        // console.log(this.queryString)
        return this.db.execute(this.queryString, this.callback);
    }
    /**
     * delete query
     * @returns
     */
    rawDelete() {
        this.queryType = Query.DELETE;
        return this.db.execute(this.queryString, this.callback);
    }
    /**
     * update query
     * @returns
     */
    rawUpdate() {
        this.queryType = Query.UPDATE;
        // console.log(this.queryString)
        return this.db.execute(this.queryString, this.callback);
    }
    /**
     * bulk insert
     * @param records
     * @returns
     */
    bulkInsert(records) {
        this.queryType = Query.INSERT;
        return this.db.insert(this.queryString, records, this.callback);
    }
    /**
     * raw insert
     * @param records
     * @returns
     */
    rawInsert(records) {
        this.queryType = Query.INSERT;
        return this.db.insert(this.queryString, [records], this.callback);
    }
    /**
     * query all
     * @returns
     */
    queryAll() {
        return this.query();
    }
    /**
     * query one
     * @returns
     */
    queryOne() {
        return this.query();
    }
    /**
     * query
     * @returns
     */
    query() {
        this.queryType = Query.SELECT;
        return this.db.query(this.queryString, this.callback);
    }
    /**
     * raw query
     * @param query
     * @returns
     */
    rawQuery(query) {
        return this.db.query(query, this.callback);
    }
    /**
     * @returns Mysql
     */
    getDb() {
        return this.db;
    }
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
    bindTransaction(db) {
        return this.db = db;
    }
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
    beginTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Connection.config === null) {
                throw Error("Db not configured");
            }
            this.db = new Mysql(Connection.config);
            yield this.db.beginTransaction(true);
            return this.db;
        });
    }
}
Connection.config = null;
export { Connection };
