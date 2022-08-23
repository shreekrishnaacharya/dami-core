import Mysql from '../db/mysql';
import BaseModel from './BaseModel';
BaseModel
export enum Query {
  INSERT = 'INSERT',
  SELECT = 'SELECT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXECUTE = 'EXECUTE',
}
abstract class Connection extends BaseModel {
  private queryString: string;
  protected queryType: string;
  static mysql: Mysql;
  constructor() {
    super();
    this.queryString = '';
    this.queryType = '';
    return this;
  }
  /**
   * function to be called after the result are available
   * @param err | error
   * @param res | result data
   */
  protected callback = (err: Error, res: object) => {
    if (err) {
      this.errorCallback(err);
    } else {
      this.successCallback(res);
    }
  };
  /**
   * setup query string to be processed
   * @param query | query string
   * @returns | current model
   */
  protected createCommand(query: string) {
    this.queryString = query;
    // console.log(this.queryString)
    return this;
  }
  /**
   * execute the query
   * @returns 
   */
  protected execute() {
    this.queryType = Query.EXECUTE;
    // console.log(this.queryString)
    return Connection.mysql.execute(this.queryString, this.callback);
  }
  /**
   * delete query
   * @returns 
   */
  protected rawDelete() {
    this.queryType = Query.DELETE;
    return Connection.mysql.execute(this.queryString, this.callback);
  }
  /**
   * update query
   * @returns 
   */
  protected rawUpdate() {
    this.queryType = Query.UPDATE;
    // console.log(this.queryString)
    return Connection.mysql.execute(this.queryString, this.callback);
  }
  /**
   * bulk insert
   * @param records 
   * @returns 
   */
  protected bulkInsert(records: any[]) {
    this.queryType = Query.INSERT;
    return Connection.mysql.insert(this.queryString, records, this.callback);
  }
  /**
   * raw insert
   * @param records 
   * @returns 
   */
  protected rawInsert(records: any[]) {
    this.queryType = Query.INSERT;
    return Connection.mysql.insert(this.queryString, [records], this.callback);
  }
  /**
   * query all
   * @returns 
   */
  protected queryAll() {
    return this.query();
  }
  /**
   * query one
   * @returns 
   */
  protected queryOne() {
    return this.query();
  }
  /**
   * query
   * @returns 
   */
  protected query() {
    this.queryType = Query.SELECT;
    return Connection.mysql.query(this.queryString, this.callback);
  }
  /**
   * raw query
   * @param query 
   * @returns 
   */
  protected rawQuery(query: string) {
    return Connection.mysql.query(query, this.callback);
  }
}

export { Connection };
