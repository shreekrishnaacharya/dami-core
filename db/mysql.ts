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

  format(query: string, values: Array<string | number>): string {
    return mysql.format(query, values)
  }

  query = (sqlQuery: string | SqlQuery, callback?: (error: Error, result: Array<any>) => void): Promise<Array<object>> => {
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

  queryOne = (sqlQuery: string | SqlQuery, callback?: (error: Error, result: Array<any>) => void): Promise<JSON | null> => {
    return this.query(sqlQuery, callback).then((res: Array<any>) => {
      if (res.length > 0) {
        return res[0]
      } else {
        return null
      }
    })
  };

  execute = (sqlQuery: SqlQuery | string, callback?): Promise<any> => {
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
            reject(err);
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

  insert = (sql: string, records, callback?): Promise<any> => {
    // console.log(sql, 'insert')
    if (this.connection === null)
      return new Promise((resolve, reject) => {
        this.beginTransaction(false).then((connection: any) => {
          connection.query(sql, records, (err: Error, result) => {
            if (!this.hasTransaction) connection.release(); // return the connection to pool
            if (err) {
              if (callback !== undefined) {
                callback(err, {});
              }
              reject(err);
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

  public beginTransaction(hasTransaction?: boolean) {
    if (hasTransaction === false) {
      this.hasTransaction = false
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

  public commit() {
    return new Promise((resolve, reject) => {
      if (this.connection === null) {
        return resolve(false)
      }
      return this.connection.commit((err) => {
        if (err) {
          return this.connection.rollback(() => {
            this.connection.release();
            return reject("Commit failed");
          });
        }
        this.connection.release();
        this.connection = null;
        this.hasTransaction = false;
        return resolve(true)
      });
    })
  }

  public rollBack() {
    return new Promise((resolve, reject) => {
      if (this.connection === null) {
        return resolve(false)
      }
      return this.connection.rollback(() => {
        this.connection.release();
        this.connection = null;
        this.hasTransaction = false;
        return resolve(true)
      });
    })
  }
}
export default Mysql;
