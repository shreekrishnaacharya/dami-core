import * as mysql from 'mysql';
import QueryBuild from './QueryBuild';
import { Connection, Query } from './Connection';
import ListModel from '../helpers/ListModel';
import JoinTable from '../helpers/JoinTable';
import assert from 'assert'

class ActiveQuery extends Connection {
  private isNew: boolean;
  private isAll: boolean;
  public joinOne: any[];
  public joinMany: any[];
  private _buildQuery: QueryBuild;
  private _glueQuery: any[]
  ['constructor']: any;
  constructor() {
    super();
    this.isNew = true;
    this.isAll = false;
    this.joinOne = [];
    this.joinMany = [];
    this._glueQuery = [];
  }

  onResult(callback: (e: any) => void): this {
    this.successCallback = (res) => {
      callback(this.getAtt(res));
    };
    return this;
  }

  onError(callback: (e: any) => void): this {
    this.errorCallback = (err: Error) => {
      callback(err);
    };
    return this;
  }

  /**
   * Insert multiple rows into table
   * @param columns : column list
   * @param record : respective row values
   * @returns boolean : true if success, false if failed
   */

  insertAll(columns: string[], record: any[][]): Promise<boolean> {
    this.checkColumn(columns);
    let insertQuery = `INSERT INTO ${this.tableName}`;
    insertQuery += `(${columns.join(',')}) VALUES ?`;
    return this.pPromise(this.createCommand(insertQuery).bulkInsert([record]));
  }
  async deleteAll(condition?: object): Promise<boolean> {
    this.checkColumn(condition);
    const [dpn, values] = this.getDelete(condition);
    return this.pPromise(this.createCommand(mysql.format(dpn.toString(), [...values])).rawDelete());
  }
  async updateAll(record: object, condition?: object): Promise<boolean> {
    this.checkColumn(record);
    this.checkColumn(condition);
    const [dpn, values] = this.getUpdate(record, condition);
    return this.pPromise(this.createCommand(mysql.format(dpn.toString(), [...values])).rawUpdate());
  }


  /**
   * Insert the loaded data of model into table
   * @param validate : validate attributes before save or not - default true
   * @returns : true on success and false on failed
   */
  async save(validate?: boolean): Promise<boolean> {
    if (!this.isLoaded()) throw new Error('Model is not loaded');
    return Promise.resolve(this.beforeSave(Query.INSERT))
      .then((e) => {
        if (validate !== false) {
          if (!this.validate()) {
            return false;
          }
        }
        return true;
      })
      .then((e) => {
        if (!e) {
          return e;
        }
        let insertQuery = `INSERT INTO ${this.tableName}`;
        const columns = [];
        const values = [];
        let count = 0;
        const _attributeName = this.getAttName(false)
        const _attributes = this.getAttributes()
        for (const ky of _attributeName) {
          if (ky in _attributes) {
            columns[count] = ky;
            values[count] = this.getValue(ky);
            count++;
          }
        }
        insertQuery += `(${columns.join(',')}) VALUES (?)`;
        return this.pPromise(this.createCommand(insertQuery).rawInsert(values));
      })
      .then((e) => {
        if (e) {
          this.afterSave(Query.INSERT);
        }
        return e;
      });
  }
  /**
   * delete the data of provided id
   * @param id : id of row to be deleted
   * @returns : true on success and false on failed
   */
  async delete(id: number | string): Promise<boolean> {
    let searchid = id;
    if (id === undefined) {
      if (this.isEmpty) {
        throw new Error('Model is empty');
      } else {
        searchid = this.primaryKey;
      }
    }
    await this.beforeDelete();
    const dq = `DELETE FROM ${this.tableName} WHERE ${this.tableName}.id=?`;
    return this.pPromise(this.createCommand(mysql.format(dq, [searchid])).rawDelete());
  }

  /**
   * update the current loaded data into provided id
   * @param id : id of row to be updated
   * @returns : true on success and false on failed
   */
  async update(id: number | string): Promise<boolean> {
    let searchid = id;
    if (id === undefined) {
      if (this.isEmpty) {
        throw new Error('Model is empty');
      } else {
        searchid = this.primaryKey;
      }
    } else {
      this.primaryKey = parseInt(id.toString(), 10);
    }
    await this.beforeSave(Query.UPDATE);
    let uq = `UPDATE ${this.tableName} SET `;
    const values = [];
    const _attributeName = this.getAttName(false)
    for (const ky of _attributeName) {
      if (this.getValue(ky) !== this.getOldValue(ky)) {
        uq += ky + '=?,';
        values.push(this.getValue(ky));
      }
    }
    if (values.length == 0) {
      return true;
    }
    values.push(searchid);
    uq = uq.slice(0, -1) + ` WHERE ${this.tableName}.id=? `;
    return this.pPromise(this.createCommand(mysql.format(uq, values)).rawUpdate());
  }
  /**
   * find one model for given id
   * @param id : id to find the row
   * @returns : if not found returns null else model
   */
  findOne(id: number | string): Promise<this | null> {
    this.isAll = false;
    this.primaryKey = parseInt(id.toString(), 10);
    this.asModelFlag = true
    const bq = new QueryBuild()
      .select(this.getSelectAs())
      .from(this.tableName)
      .doLeftJoin(this.joinOne)
      .where(` ${this.tableName}.id=${id} `)
      .build();
    this.createCommand(bq);
    return this.pPromise(this.query());
  }
  /**
   * find the model based on callback QueryBuild
   * @param callback : Callback function with argument type "QueryBuild"
   * @returns : current model
   */
  find(callback?: (e: QueryBuild) => QueryBuild): this {
    if (callback === undefined) {
      this.createCommand(
        new QueryBuild().select(this.getSelectAs()).doLeftJoin(this.joinOne).from(this.tableName).build(),
      );
    } else {
      this.createCommand(
        callback(new QueryBuild().select(this.getSelectAs()).doLeftJoin(this.joinOne).from(this.tableName)).build(),
      );
    }
    return this;
  }
  /**
   * get one model
   * @returns : if not found returns null else model
   */
  async one(): Promise<this | null> {
    this.isAll = false;
    this.asModel()
    return this.pPromise(this.query());
  }
  /**
   * get list of model
   * @returns array of model or ListModel of model
   */
  async all(): Promise<ListModel<this | object>> {
    this.isAll = true;
    return this.pPromise(this.query());
  }
  /**
   * get list of model
   * @returns array of model or ListModel of model
   */
  async findAll(): Promise<ListModel<this | object>> {
    this.isAll = true;
    this.createCommand(
      new QueryBuild().select(this.getSelectAs()).from(this.tableName).doLeftJoin(this.joinOne).build(),
    );
    return this.pPromise(this.query());
  }
  /**
   * 
   * @param result : list of model
   * @returns :list of model with glued attribute(s)
   */
  private getGlueBuild(result: Array<this>): Promise<Array<this>> {
    let resultSet = result;
    const promish = this._glueQuery.map((gk) => {
      const [qr, nam] = gk
      let qury = qr(result);
      if (typeof qury != "string") {
        qury = qury.build()
      }
      assert(this.validateGlue(qury))
      return this.rawQuery(qury).then((res: Array<any>) => {
        resultSet = resultSet.map((rs, i) => {
          const newmod = res.find(e => rs.id == e[this.getMyId()])
          if (newmod !== undefined) {
            delete newmod[this.getMyId()]
            rs[nam] = newmod
          } else {
            rs[nam] = null
          }
          return rs
        })
      })
    })
    return Promise.all(promish).then(e => resultSet)
  }
  /**
   * get QueryBuild of current model
   * @returns : QueryBuild
   */
  getBuild(): QueryBuild {
    return new QueryBuild().select(this.getSelectAs()).doLeftJoin(this.joinOne).from(this.tableName);
  }
  /**
   * 
   * @param build : query build
   */
  setBuild(build: QueryBuild): this {
    this.createCommand(build.build());
    return this
  }
  /**
   * set return type, either as model or json object
   * @param flag : true for object, false for model
   * @returns : current model
   */
  asObject(flag?: boolean) {
    if (flag !== undefined) {
      this.asModelFlag = !flag;
    } else {
      this.asModelFlag = false;
    }
    return this;
  }
  /**
   * set return type, either as model or json object
   * @param flag : true for model, false for json object
   * @returns : current model
   */
  asModel(flag?: boolean) {
    if (flag !== undefined) {
      this.asModelFlag = flag;
    } else {
      this.asModelFlag = true;
    }
    return this;
  }
  /**
   * setup join table on foreign key
   * @param table : model of table to join
   * @param condition : condition to join table on
   * @param name : attribute where join model will be available
   * @returns : current model
   */
  protected hasOne(table: any, condition: object, name: string) {
    this.joinOne.push([name, table, condition]);
    return this;
  }
  /**
   * force join table
   * @param fun : function that will have logic to build QueryBuild and return
   * @param name : attribute where join model will be available
   * @returns : current model
   */
  protected glueQuery(fun: Function, name: string) {
    this._glueQuery.push([fun, name]);
    return this
  }
  /**
   * setup join on child table for many
   * @param table : model of table to join
   * @param condition : condition to join table on
   * @param name : attribute where join model will be available
   * @returns : current model
   */
  protected hasMany(table: any, condition: object, name: string) {
    this.joinMany.push([name, table, condition]);
    return this;
  }

  private async pPromise(promise: Promise<any>) {
    const result = await promise;
    return this.getAtt(result);
  }

  private getAtt(result: any) {
    if (this.queryType === Query.DELETE) {
      this.afterDelete();
      return result.affectedRows > 0 ? true : false;
    } else if (this.queryType === Query.UPDATE) {
      if (result.affectedRows === 0) {
        return false;
      }
      this.swapOldAtteribute();
      // this.load({ id: this.primaryKey, ...this.getAttributes() });
      this.isEmpty = false;
      this.isNew = false;
      this.afterSave(Query.UPDATE);
      return true;
    } else if (this.queryType === Query.INSERT) {
      if (!result.hasOwnProperty('insertId')) {
        return false;
      }
      this.primaryKey = result.insertId;
      this.swapOldAtteribute();
      this.load({ id: this.primaryKey, ...this.getAttributes() });
      this.isEmpty = false;
      this.isNew = false;
      this.afterSave(Query.INSERT);
      return true;
    }
    if (result.length === 0) {
      if (this.asModelFlag) {
        this.isEmpty = true;
        return this.isAll ? new ListModel<this>() : null;
      } else {
        return this.isAll ? new ListModel<object>() : null;
      }
    }
    if (this.isCustomColumn) {
      if (!this.isAll) {
        return result[0]
      }
      const res = new ListModel<this>()
      res.addAll(result)
      return res;
    }
    const joinTable = new JoinTable();
    joinTable.setModel(this);
    const output = [];
    if (!this.asModelFlag) {
      for (const ky of result) {
        const row = this.getMyRow(ky);
        for (const [name, mod] of this.joinOne) {
          const model = new mod();
          row[name] = model.getMyRow(ky);
        }
        output.push(row);
      }
    } else {
      for (const ky of result) {
        const model = new this.constructor(this.tableName);
        model.scenario = this.scenario;
        model.getMyRow(ky, true);
        for (const [name, mod] of this.joinOne) {
          model[name] = new mod();
          model[name].getMyRow(ky, true)
        }
        output.push(model);
      }
    }

    joinTable.setResult(output);
    if (this.isAll) {
      return joinTable.getResult().then((r) => {
        return this.getGlueBuild(r)
      }).then((r) => {
        if (this.toListFlag) {
          const allModel = new ListModel<this>();
          allModel.addAll(r)
          return allModel;
        }
        return r;
      })
    }
    this.isEmpty = false;
    return joinTable.getResult().then((r) => {
      return this.getGlueBuild(r)
    }).then(r => r[0])
  }

  private validateGlue(query: string) {
    try {
      if (query.toLowerCase().split("select")[1].split("from")[0].includes(this.getMyId()))
        return true
    } catch (err) { }
    return false
  }
}

export default ActiveQuery;
