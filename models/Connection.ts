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

  protected callback = (err: Error, res: object) => {
    if (err) {
      this.errorCallback(err);
    } else {
      this.successCallback(res);
    }
  };

  protected createCommand(query: string) {
    this.queryString = query;
    // console.log(this.queryString)
    return this;
  }

  protected execute() {
    this.queryType = Query.EXECUTE;
    // console.log(this.queryString)
    return Connection.mysql.execute(this.queryString, this.callback);
  }

  protected rawDelete() {
    this.queryType = Query.DELETE;
    return Connection.mysql.execute(this.queryString, this.callback);
  }
  protected rawUpdate() {
    this.queryType = Query.UPDATE;
    // console.log(this.queryString)
    return Connection.mysql.execute(this.queryString, this.callback);
  }
  protected bulkInsert(records: any[]) {
    this.queryType = Query.INSERT;
    return Connection.mysql.insert(this.queryString, records, this.callback);
  }

  protected rawInsert(records: any[]) {
    this.queryType = Query.INSERT;
    return Connection.mysql.insert(this.queryString, [records], this.callback);
  }

  protected queryAll() {
    return this.query();
  }

  protected queryOne() {
    return this.query();
  }

  protected query() {
    this.queryType = Query.SELECT;
    return Connection.mysql.query(this.queryString, this.callback);
  }
}

export { Connection };
