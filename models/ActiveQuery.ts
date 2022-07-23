import * as mysql from 'mysql';
import QueryBuild from './QueryBuild';
import { Connection, Query } from './Connection';
import ListModel from '../helpers/ListModel';
import JoinTable from '../helpers/JoinTable';

class ActiveQuery extends Connection {
  private isNew: boolean;
  private isAll: boolean;
  public joinOne: any[];
  public joinMany: any[];

  ['constructor']: any;
  constructor() {
    super();
    this.isNew = true;
    this.isAll = false;
    this.joinOne = [];
    this.joinMany = [];
  }

  onResult(callback: (e: any) => void) {
    this.successCallback = (res) => {
      callback(this.getAtt(res));
    };
    return this;
  }

  onError(callback: (e: any) => void) {
    this.errorCallback = (err: Error) => {
      callback(err);
    };
    return this;
  }

  async insertAll(columns: string[], record: any[][]) {
    this.checkColumn(columns);
    let insertQuery = `INSERT INTO ${this.tableName}`;
    insertQuery += `(${columns.join(',')}) VALUES ?`;
    return this.pPromise(this.createCommand(insertQuery).bulkInsert([record]));
  }
  async deleteAll(condition?: object) {
    this.checkColumn(condition);
    const [dpn, values] = this.getDelete(condition);
    return this.pPromise(this.createCommand(mysql.format(dpn.toString(), [...values])).rawDelete());
  }
  async updateAll(record: object, condition?: object) {
    this.checkColumn(record);
    this.checkColumn(condition);
    const [dpn, values] = this.getUpdate(record, condition);
    return this.pPromise(this.createCommand(mysql.format(dpn.toString(), [...values])).rawUpdate());
  }
  async save(validate?: boolean) {
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

  async delete(id: number | string) {
    let searchid = id;
    if (id === undefined) {
      if (this.isEmpty) {
        throw new Error('Model is empty');
      } else {
        searchid = this.primaryKey;
      }
    }
    this.beforeDelete();
    const dq = `DELETE FROM ${this.tableName} WHERE ${this.tableName}.id=?`;
    return this.pPromise(this.createCommand(mysql.format(dq, [searchid])).rawDelete());
  }

  async update(id: number | string) {
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
    let uq = `UPDATE ${this.tableName} SET `;
    const values = [];
    const _attributes = this.getAttributes();
    for (const ky of Object.keys(_attributes)) {
      uq += ky + '=?,';
      values.push(this.getValue(ky));
    }
    values.push(searchid);
    uq = uq.slice(0, -1) + ` WHERE ${this.tableName}.id=? `;
    this.beforeSave(Query.UPDATE);
    return this.pPromise(this.createCommand(mysql.format(uq, values)).rawUpdate());
  }

  async findOne(id: number | string) {
    this.isAll = false;
    this.primaryKey = parseInt(id.toString(), 10);
    const bq = new QueryBuild()
      .select(this.getSelectAs())
      .from(this.tableName)
      .doLeftJoin(this.joinOne)
      .where(` ${this.tableName}.id=${id} `)
      .build();
    this.createCommand(bq);
    return this.pPromise(this.query());
  }

  find(callback?: (e: QueryBuild) => QueryBuild) {
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

  async one() {
    this.isAll = false;
    return this.pPromise(this.query());
  }

  async all() {
    this.isAll = true;
    return this.pPromise(this.query());
  }

  async findAll() {
    this.isAll = true;
    this.createCommand(
      new QueryBuild().select(this.getSelectAs()).from(this.tableName).doLeftJoin(this.joinOne).build(),
    );
    return this.pPromise(this.query());
  }

  getBuild() {
    return new QueryBuild().select(this.getSelectAs()).doLeftJoin(this.joinOne).from(this.tableName);
  }

  async setBuild(build: QueryBuild) {
    this.isAll = true;
    this.createCommand(build.build());
    return this.pPromise(this.query());
  }

  asObject(flag?: boolean) {
    if (flag !== undefined) {
      this.asModelFlag = !flag;
    } else {
      this.asModelFlag = false;
    }
    return this;
  }

  asModel(flag?: boolean) {
    if (flag !== undefined) {
      this.asModelFlag = flag;
    } else {
      this.asModelFlag = true;
    }
    return this;
  }

  protected hasOne(table: any, condition: object, name: string) {
    this.joinOne.push([name, table, condition]);
    return this;
  }
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
      this.load({ id: this.primaryKey, ...this.getAttributes() });
      this.isEmpty = false;
      this.isNew = false;
      // this.afterSave(Query.UPDATE);
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
      // this.afterSave(Query.INSERT);
      return true;
    }
    if (result.length === 0) {
      if (this.asModelFlag) {
        this.isEmpty = true;
        return this.isAll ? new ListModel() : null;
      } else {
        return this.isAll ? [] : null;
      }
    }
    if (this.isCustomColumn) {
      return this.isAll ? result : result[0];
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
        if (!this.asModelFlag) {
          return r;
        }
        if (this.toListFlag) {
          const allModel = new ListModel();
          r.forEach((a) => {
            allModel.add(a);
          });
          return allModel;
        }
        return r;
      });
    }
    this.isEmpty = false;
    return joinTable.getResult().then((r) => {
      return r[0];
    });
  }
}

export default ActiveQuery;
