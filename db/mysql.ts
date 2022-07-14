import * as mysql from 'mysql';
class Mysql {
  private con: any;
  constructor(dbConfig: object) {
    this.con = mysql.createPool(dbConfig);
  }

  query = (sql: string, callback?: (error: Error, result: Array<any>) => void) => {
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

  execute = (sql, callback) => {
    return new Promise((resolve, reject) => {
      this.con.getConnection((err1: Error, connection) => {
        if (err1) throw err1;
        connection.query(sql, (err: Error, result) => {
          connection.release(); // return the connection to pool
          if (err) {
            callback(err, {});
            reject(err);
          } else {
            callback(err, result);
            resolve(result);
          }
        });
      });
    });
  };

  insert = (sql, records, callback) => {
    return new Promise((resolve, reject) => {
      this.con.getConnection((err1: Error, connection) => {
        if (err1) throw err1;
        connection.query(sql, records, (err: Error, result) => {
          connection.release(); // return the connection to pool
          if (err) {
            callback(err, {});
            reject(err);
          } else {
            callback(err, result);
            resolve(result);
          }
        });
      });
    });
  };
}
export default Mysql;
