import Dami from '../app/Dami';
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
  private db: Mysql;
  constructor() {
    super();
    this.queryString = '';
    this.queryType = '';
    // this.db = Dami.db;
    // return this;
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
    return this;
  }
  /**
   * execute the query
   * @returns 
   */
  protected execute(): Promise<any> {
    this.queryType = Query.EXECUTE;
    // console.log(this.queryString)
    return this.db.execute(this.queryString, this.callback);
  }
  /**
   * delete query
   * @returns 
   */
  protected rawDelete(): Promise<any> {
    this.queryType = Query.DELETE;
    return this.db.execute(this.queryString, this.callback);
  }
  /**
   * update query
   * @returns 
   */
  protected rawUpdate(): Promise<any> {
    this.queryType = Query.UPDATE;
    // console.log(this.queryString)
    return this.db.execute(this.queryString, this.callback);
  }
  /**
   * bulk insert
   * @param records 
   * @returns 
   */
  protected bulkInsert(records: any[]): Promise<any> {
    this.queryType = Query.INSERT;
    return this.db.insert(this.queryString, records, this.callback);
  }
  /**
   * raw insert
   * @param records 
   * @returns 
   */
  protected rawInsert(records: any[]): Promise<any> {
    this.queryType = Query.INSERT;
    return this.db.insert(this.queryString, [records], this.callback);
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
  protected query(): Promise<object[]> {
    this.queryType = Query.SELECT;
    return this.db.query(this.queryString, this.callback);
  }
  /**
   * raw query
   * @param query 
   * @returns 
   */
  protected rawQuery(query: string): Promise<object[]> {
    return this.db.query(query, this.callback);
  }

  /**
   * @returns Mysql
   */
  protected getDb(): Mysql {
    return this.db;
  }

  /**
   * @returns Mysql
   */
  protected setDb(db: Mysql) {
    return this.db = db;
  }

  public async beginTransaction() {
    this.db = new Mysql(Dami.dbConfig);
    await this.db.beginTransaction();
    return this.db;
  }
}

export { Connection };
