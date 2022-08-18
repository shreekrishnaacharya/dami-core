import * as mysql from 'mysql';


type SqlQuery = [string, Array<string | number>];
class Mysql {
  private con: any;
  constructor(dbConfig: object) {
    this.con = mysql.createPool(dbConfig);
  }

  format(query: string, values: Array<string | number>) {
    return mysql.format(query, values)
  }

  query = (sqlQuery: string | SqlQuery, callback?: (error: Error, result: Array<any>) => void) => {
    let sql = "";
    if (typeof sqlQuery === "string") {
      sql = sqlQuery.toString();
    } else {
      sql = mysql.format(sqlQuery[0], [...sqlQuery[1]])
    }
    return new Promise((resolve, reject) => {
      this.con.getConnection((err1: Error, connection) => {
        if (err1) throw err1;
        connection.query(sql, (err2: Error, result) => {
          connection.release(); // return the connection to pool
          if (err2) throw err2;
          if (callback !== undefined) {
            callback(err2, Object.values(JSON.parse(JSON.stringify(result))));
          }
          resolve(Object.values(JSON.parse(JSON.stringify(result))));
        });
      });
    });
  };

  queryOne = (sqlQuery: string | SqlQuery, callback?: (error: Error, result: Array<any>) => void) => {
    return this.query(sqlQuery, callback).then((res: Array<any>) => {
      if (res.length > 0) {
        return res[0]
      } else {
        res
      }
    })
  };

  execute = (sqlQuery: SqlQuery | string, callback?) => {
    let sql = "";
    if (sqlQuery instanceof String) {
      sql = sqlQuery.toString();
    } else {
      sql = mysql.format(sqlQuery[0], [...sqlQuery[1]])
    }
    console.log(sql, 'execute')
    return new Promise((resolve, reject) => {
      this.con.getConnection((err1: Error, connection) => {
        if (err1) throw err1;
        connection.query(sql, (err: Error, result) => {
          connection.release(); // return the connection to pool
          if (err) {
            if (callback !== undefined) {
              callback(err, {});
            }
            reject(err);
          } else {
            if (callback !== undefined) {
              callback(err, Object.values(JSON.parse(JSON.stringify(result))));
            }
            resolve(result);
          }
        });
      });
    });
  };

  insert = (sql: string, records, callback?) => {
    return new Promise((resolve, reject) => {
      this.con.getConnection((err1: Error, connection) => {
        if (err1) throw err1;
        connection.query(sql, records, (err: Error, result) => {
          connection.release(); // return the connection to pool
          if (err) {
            if (callback !== undefined) {
              callback(err, {});
            }
            reject(err);
          } else {
            if (callback !== undefined) {
              callback(err, Object.values(JSON.parse(JSON.stringify(result))));
            }
            resolve(result);
          }
        });
      });
    });
  };
}
export default Mysql;
