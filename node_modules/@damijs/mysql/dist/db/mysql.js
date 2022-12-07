import { isEmpty } from '@damijs/hp';
import * as mysql from 'mysql';
import MyPool from './mypool';
class Mysql {
    constructor(dbConfig) {
        this.connection = null;
        this.hasTransaction = false;
        if (Mysql.con === null) {
            if (isEmpty(dbConfig)) {
                throw Error('db configuration must be initilize');
            }
            if (dbConfig.dummy === true) {
                Mysql.con = new MyPool(dbConfig);
            }
            else {
                if (!("port" in dbConfig)) {
                    dbConfig = Object.assign(dbConfig, { port: 3306 });
                }
                Mysql.con = mysql.createPool(dbConfig);
            }
        }
        this.connection = null;
        this.hasTransaction = false;
    }
    /**
     *
     * @param query
     * @param values
     * @returns
     */
    format(query, values) {
        return mysql.format(query, values);
    }
    /**
     *
     * @param sqlQuery
     * @param callback
     * @returns
     */
    query(sqlQuery, callback) {
        let sql = "";
        if (typeof sqlQuery === "string") {
            sql = sqlQuery.toString();
        }
        else {
            sql = mysql.format(sqlQuery[0], [...sqlQuery[1]]);
        }
        // console.log(sql, "query")
        return new Promise((resolve, reject) => {
            this.beginTransaction(false).then((connection) => {
                connection.query(sql, (err2, result) => {
                    if (!this.hasTransaction)
                        connection.release(); // return the connection to pool
                    if (err2)
                        throw err2;
                    if (callback !== undefined) {
                        callback(err2, Object.values(JSON.parse(JSON.stringify(result))));
                    }
                    resolve(Object.values(JSON.parse(JSON.stringify(result))));
                });
            });
        });
    }
    ;
    /**
     *
     * @param sqlQuery
     * @param callback
     * @returns
     */
    queryOne(sqlQuery, callback) {
        return this.query(sqlQuery, callback).then((res) => {
            if (res.length > 0) {
                return res[0];
            }
            else {
                return null;
            }
        });
    }
    ;
    /**
     *
     * @param sqlQuery
     * @param callback
     * @returns
     */
    execute(sqlQuery, callback) {
        let sql = "";
        if (typeof sqlQuery === "string") {
            sql = sqlQuery.toString();
        }
        else {
            sql = mysql.format(sqlQuery[0], [...sqlQuery[1]]);
        }
        // console.log(sql, 'execute')
        return new Promise((resolve, reject) => {
            this.beginTransaction(false).then((connection) => {
                connection.query(sql, (err, result) => {
                    if (!this.hasTransaction)
                        connection.release(); // return the connection to pool
                    if (err) {
                        if (callback !== undefined) {
                            callback(err, {});
                        }
                        throw err;
                    }
                    else {
                        if (callback !== undefined) {
                            callback(err, result);
                        }
                        resolve(result);
                    }
                });
            });
        });
    }
    ;
    /**
     *
     * @param sql
     * @param records
     * @param callback
     * @returns
     */
    insert(sql, records, callback) {
        // console.log(sql, 'insert')
        return new Promise((resolve, reject) => {
            this.beginTransaction(false).then((connection) => {
                connection.query(sql, records, (err, result) => {
                    if (!this.hasTransaction)
                        connection.release(); // return the connection to pool
                    if (err) {
                        if (callback !== undefined) {
                            callback(err, {});
                        }
                        throw err;
                    }
                    else {
                        if (callback !== undefined) {
                            callback(err, result);
                        }
                        resolve(result);
                    }
                });
            });
        });
    }
    ;
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
    beginTransaction(hasTransaction) {
        if (this.connection !== null) {
            return Promise.resolve(this.connection);
        }
        if (hasTransaction === true) {
            this.hasTransaction = true;
        }
        else {
            this.hasTransaction = false;
        }
        return new Promise((resolve, reject) => {
            if (this.hasTransaction === false) {
                return Mysql.con.getConnection((err1, connection) => {
                    if (err1)
                        throw err1;
                    return resolve(connection);
                });
            }
            Mysql.con.getConnection((err1, connection) => {
                if (err1)
                    throw err1;
                return connection.beginTransaction((err) => {
                    if (err) {
                        connection.release();
                        throw err;
                    }
                    this.connection = connection;
                    resolve(connection);
                });
            });
        });
    }
    /**
     * Commit transaction
     * @returns
     */
    commit() {
        return new Promise((resolve, reject) => {
            if (this.connection === null) {
                return resolve(false);
            }
            return this.connection.commit((err) => {
                if (err) {
                    return this.connection.rollback(() => {
                        // this.connection.release();
                        throw err;
                    });
                }
                this.connection.release();
                this.connection = null;
                this.hasTransaction = false;
                return resolve(true);
            });
        });
    }
    /**
     * Rollback the transaction
     * @returns
     */
    rollBack() {
        return new Promise((resolve, reject) => {
            if (this.connection === null) {
                return resolve(false);
            }
            return this.connection.rollback(() => {
                // this.connection.release();
                this.connection = null;
                this.hasTransaction = false;
                return resolve(true);
            });
        });
    }
}
Mysql.con = null;
export default Mysql;
