import * as mysql from 'mysql';
import { IDatabase } from '../config/IConfig';
import MyPool from './mypool';

type SqlQuery = [string, Array<string | number>];
class Mysql {
  private con: any;
  private connection = null;
  private hasTransaction: boolean = false;
  constructor(dbConfig: IDatabase) {
    if (dbConfig.dummy === true) {
      this.con = new MyPool(dbConfig);
    } else {
      this.con = mysql.createPool(dbConfig);
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
  format(query: string, values: Array<string | number>): string {
    return mysql.format(query, values)
  }
  /**
   * 
   * @param sqlQuery 
   * @param callback 
   * @returns 
   */
  query(sqlQuery: string | SqlQuery, callback?: (error: Error, result: Array<any>) => void): Promise<Array<object>> {
    let sql = "";
    if (typeof sqlQuery === "string") {
      sql = sqlQuery.toString();
    } else {
      sql = mysql.format(sqlQuery[0], [...sqlQuery[1]])
    }
    // console.log(sql, "query")
    return new Promise((resolve, reject) => {
      this.beginTransaction(false).then((connection: any) => {
        connection.query(sql, (err2: Error, result) => {
          if (!this.hasTransaction) connection.release(); // return the connection to pool
          if (err2) throw err2;
          if (callback !== undefined) {
            callback(err2, Object.values(JSON.parse(JSON.stringify(result))));
          }
          resolve(Object.values(JSON.parse(JSON.stringify(result))));
        });
      });
    });
  };
  /**
   * 
   * @param sqlQuery 
   * @param callback 
   * @returns 
   */
  queryOne(sqlQuery: string | SqlQuery, callback?: (error: Error, result: Array<any>) => void): Promise<JSON | null> {
    return this.query(sqlQuery, callback).then((res: Array<any>) => {
      if (res.length > 0) {
        return res[0]
      } else {
        return null
      }
    })
  };
  /**
   * 
   * @param sqlQuery 
   * @param callback 
   * @returns 
   */
  execute(sqlQuery: SqlQuery | string, callback?): Promise<any> {
    let sql = "";
    if (typeof sqlQuery === "string") {
      sql = sqlQuery.toString();
    } else {
      sql = mysql.format(sqlQuery[0], [...sqlQuery[1]])
    }
    // console.log(sql, 'execute')
    return new Promise((resolve, reject) => {
      this.beginTransaction(false).then((connection: any) => {
        connection.query(sql, (err: Error, result) => {
          if (!this.hasTransaction) connection.release(); // return the connection to pool
          if (err) {
            if (callback !== undefined) {
              callback(err, {});
            }
            throw err
          } else {
            if (callback !== undefined) {
              callback(err, result);
            }
            resolve(result);
          }
        });
      });
    });
  };
  /**
   * 
   * @param sql 
   * @param records 
   * @param callback 
   * @returns 
   */
  insert(sql: string, records, callback?): Promise<any> {
    // console.log(sql, 'insert')
    return new Promise((resolve, reject) => {
      this.beginTransaction(false).then((connection: any) => {
        connection.query(sql, records, (err: Error, result) => {
          if (!this.hasTransaction) connection.release(); // return the connection to pool
          if (err) {
            if (callback !== undefined) {
              callback(err, {});
            }
            throw err
          } else {
            if (callback !== undefined) {
              callback(err, result);
            }
            resolve(result);
          }
        });
      })
    });
  };
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
  public beginTransaction(hasTransaction?: boolean) {
    if (hasTransaction === true) {
      this.hasTransaction = true
    }
    if (this.connection !== null) {
      return Promise.resolve(this.connection);
    }
    return new Promise((resolve, reject) => {
      if (this.hasTransaction === false) {
        return this.con.getConnection((err1: Error, connection: any) => {
          if (err1) throw err1
          return resolve(connection)
        })
      }
      this.con.getConnection((err1: Error, connection: any) => {
        if (err1) throw err1
        return connection.beginTransaction((err: Error) => {
          if (err) {
            connection.release();
            throw err
          }
          this.connection = connection;
          resolve(connection)
        });
      });
    })
  }
  /**
   * Commit transaction
   * @returns 
   */
  public commit() {
    return new Promise((resolve, reject) => {
      if (this.connection === null) {
        return resolve(false)
      }
      return this.connection.commit((err) => {
        if (err) {
          return this.connection.rollback(() => {
            // this.connection.release();
            throw err
          });
        }
        this.connection.release();
        this.connection = null;
        this.hasTransaction = false;
        return resolve(true)
      });
    })
  }
  /**
   * Rollback the transaction
   * @returns 
   */
  public rollBack() {
    return new Promise((resolve, reject) => {
      if (this.connection === null) {
        return resolve(false)
      }
      return this.connection.rollback(() => {
        // this.connection.release();
        this.connection = null;
        this.hasTransaction = false;
        return resolve(true)
      });
    })
  }
}
export default Mysql;
