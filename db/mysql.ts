import * as mysql from 'mysql';
import { IDatabase } from '../config/IConfig';
import MyPool from './mypool';

type SqlQuery = [string, Array<string | number>];
class Mysql {
  private con: any;
  private hasTransaction: boolean = false
  constructor(dbConfig: IDatabase, transaction?: boolean) {
    if (dbConfig.dummy === true) {
      this.con = new MyPool(dbConfig);
    } else {
      this.con = mysql.createPool(dbConfig);
    }
    if (transaction === true) {
      this.hasTransaction = true;
    }
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
    // return new Promise((resolve, reject) => {
    //   this.con.getConnection((err1: Error, connection) => {
    //     if (err1) throw err1;
    //     connection.query(sql, (err2: Error, result) => {
    //       connection.release(); // return the connection to pool
    //       if (err2) throw err2;
    //       if (callback !== undefined) {
    //         callback(err2, Object.values(JSON.parse(JSON.stringify(result))));
    //       }
    //       resolve(Object.values(JSON.parse(JSON.stringify(result))));
    //     });
    //   });
    // });

    return new Promise((resolve, reject) => {
      return this.getResult(resolve, reject)
    }).then((connection: any) => {
      connection.query(sql, (err2: Error, result) => {
        connection.release(); // return the connection to pool
        if (err2) throw err2;
        if (callback !== undefined) {
          callback(err2, Object.values(JSON.parse(JSON.stringify(result))));
        }
        return Object.values(JSON.parse(JSON.stringify(result)))
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
    return new Promise((resolve, reject) => {
      return this.getResult(resolve, reject)
    }).then((connection: any) => {
      return connection.query(sql, (err: Error, result) => {
        connection.release(); // return the connection to pool
        if (err) {
          if (callback !== undefined) {
            callback(err, {});
          }
          throw err;
        } else {
          if (callback !== undefined) {
            callback(err, result);
          }
          return result;
        }
      });
    }).catch(err => {
      if (callback !== undefined) {
        callback(err, {});
      }
      throw err;
    })
  };

  insert = (sql: string, records, callback?): Promise<any> => {
    // console.log(sql, 'insert')
    return new Promise((resolve, reject) => {
      return this.getResult(resolve, reject)
    }).then((connection: any) => {
      connection.query(sql, records, (err: Error, result) => {
        connection.release(); // return the connection to pool
        if (err) {
          if (callback !== undefined) {
            callback(err, {});
          }
          throw err;
        } else {
          if (callback !== undefined) {
            callback(err, result);
          }
          return result;
        }
      });
    }).catch(err => {
      if (callback !== undefined) {
        callback(err, {});
      }
    })
  };

  private getResult(resolve, reject) {
    this.con.getConnection((err1: Error, connection) => {
      if (err1) {
        reject(err1)
      } else {
        resolve(connection)
      }
    });
  }
}
export default Mysql;
