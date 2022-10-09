var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as mysql from 'mysql';
import QueryBuild from './QueryBuild';
import { Connection, Query } from './Connection';
import ListModel from '../helpers/ListModel';
import JoinTable from '../helpers/JoinTable';
// import assert from 'assert'
/**
 *
 *
 * @class ActiveQuery
 * @extends {Connection}
 */
class ActiveQuery extends Connection {
    constructor() {
        super();
        this.isNew = true;
        this.isAll = false;
        this.joinOne = [];
        this.joinMany = [];
        this._glueQuery = [];
    }
    onResult(callback) {
        this.successCallback = (res) => {
            callback(this.getAtt(res));
        };
        return this;
    }
    onError(callback) {
        this.errorCallback = (err) => {
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
    insertAll(columns, record) {
        this.checkColumn(columns);
        let insertQuery = `INSERT INTO ${this.tableName}`;
        insertQuery += `(${columns.join(',')}) VALUES ?`;
        return this.pPromise(this.createCommand(insertQuery).bulkInsert([record]));
    }
    /**
     *
     *
     * @param {object} [condition]
     * @return {*}  {Promise<boolean>}
     * @memberof ActiveQuery
     */
    deleteAll(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkColumn(condition);
            const [dpn, values] = this.getDelete(condition);
            return this.pPromise(this.createCommand(mysql.format(dpn.toString(), [...values])).rawDelete());
        });
    }
    /**
     *
     *
     * @param {object} record
     * @param {object} [condition]
     * @return {*}  {Promise<boolean>}
     * @memberof ActiveQuery
     */
    updateAll(record, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkColumn(record);
            this.checkColumn(condition);
            const [dpn, values] = this.getUpdate(record, condition);
            return this.pPromise(this.createCommand(mysql.format(dpn.toString(), [...values])).rawUpdate());
        });
    }
    /**
     * Insert the loaded data of model into table
     * @param validate : validate attributes before save or not - default true
     * @returns : true on success and false on failed
     */
    save(validate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isLoaded())
                throw new Error('Model is not loaded');
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
                const _attributeName = this.getAttName(false);
                const _attributes = this.getAttributes();
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
        });
    }
    /**
     * delete the data of provided id
     * @param id : id of row to be deleted
     * @returns : true on success and false on failed
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let searchid = id;
            if (id === undefined) {
                if (this.isEmpty) {
                    throw new Error('Model is empty');
                }
                else {
                    searchid = this.primaryKey;
                }
            }
            yield this.beforeDelete();
            const dq = `DELETE FROM ${this.tableName} WHERE ${this.tableName}.id=?`;
            return this.pPromise(this.createCommand(mysql.format(dq, [searchid])).rawDelete());
        });
    }
    /**
     * update the current loaded data into provided id
     * @param id : id of row to be updated
     * @returns : true on success and false on failed
     */
    update(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let searchid = id;
            if (id === undefined) {
                if (this.isEmpty) {
                    throw new Error('Model is empty');
                }
                else {
                    searchid = this.primaryKey;
                }
            }
            else {
                this.primaryKey = parseInt(id.toString(), 10);
            }
            yield this.beforeSave(Query.UPDATE);
            let uq = `UPDATE ${this.tableName} SET `;
            const values = [];
            const _attributeName = this.getAttName(false);
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
        });
    }
    /**
     * find one model for given id
     * @param id : id to find the row
     * @returns : if not found returns null else model
     */
    findOne(id) {
        this.isAll = false;
        this.primaryKey = parseInt(id.toString(), 10);
        this.asModelFlag = true;
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
    find(callback) {
        if (callback === undefined) {
            this.createCommand(new QueryBuild().select(this.getSelectAs()).doLeftJoin(this.joinOne).from(this.tableName).build());
        }
        else {
            this.createCommand(callback(new QueryBuild().select(this.getSelectAs()).doLeftJoin(this.joinOne).from(this.tableName)).build());
        }
        return this;
    }
    /**
     * get one model
     * @returns : if not found returns null else model
     */
    one() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isAll = false;
            this.asModel();
            return this.pPromise(this.query());
        });
    }
    /**
     * get list of model
     * @returns array of model or ListModel of model
     */
    all() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isAll = true;
            return this.pPromise(this.query());
        });
    }
    /**
     * get list of model
     * @returns array of model or ListModel of model
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isAll = true;
            this.createCommand(new QueryBuild().select(this.getSelectAs()).from(this.tableName).doLeftJoin(this.joinOne).build());
            return this.pPromise(this.query());
        });
    }
    /**
     *
     * @param result : list of model
     * @returns :list of model with glued attribute(s)
     */
    getGlueBuild(result) {
        let resultSet = result;
        const promish = this._glueQuery.map((gk) => {
            const [qr, nam] = gk;
            let qury = qr(result);
            if (typeof qury != "string") {
                qury = qury.build();
            }
            // assert(this.validateGlue(qury))
            return this.rawQuery(qury).then((res) => {
                resultSet = resultSet.map((rs, i) => {
                    const newmod = res.find(e => rs.id == e[this.getMyId()]);
                    if (newmod !== undefined) {
                        delete newmod[this.getMyId()];
                        rs[nam] = newmod;
                    }
                    else {
                        rs[nam] = null;
                    }
                    return rs;
                });
            });
        });
        return Promise.all(promish).then(e => resultSet);
    }
    /**
     * get QueryBuild of current model
     * @returns : QueryBuild
     */
    getBuild() {
        return new QueryBuild().select(this.getSelectAs()).doLeftJoin(this.joinOne).from(this.tableName);
    }
    /**
     *
     * @param build : query build
     */
    setBuild(build) {
        this.createCommand(build.build());
        return this;
    }
    /**
     * set return type, either as model or json object
     * @param flag : true for object, false for model
     * @returns : current model
     */
    asObject(flag) {
        if (flag !== undefined) {
            this.asModelFlag = !flag;
        }
        else {
            this.asModelFlag = false;
        }
        return this;
    }
    /**
     * set return type, either as model or json object
     * @param flag : true for model, false for json object
     * @returns : current model
     */
    asModel(flag) {
        if (flag !== undefined) {
            this.asModelFlag = flag;
        }
        else {
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
    hasOne(table, condition, name) {
        this.joinOne.push([name, table, condition]);
        return this;
    }
    /**
     * force join table
     * @param fun : function that will have logic to build QueryBuild and return
     * @param name : attribute where join model will be available
     * @returns : current model
     */
    glueQuery(fun, name) {
        this._glueQuery.push([fun, name]);
        return this;
    }
    /**
     * setup join on child table for many
     * @param table : model of table to join
     * @param condition : condition to join table on
     * @param name : attribute where join model will be available
     * @returns : current model
     */
    hasMany(table, condition, name) {
        this.joinMany.push([name, table, condition]);
        return this;
    }
    /**
     *
     *
     * @private
     * @param {Promise<any>} promise
     * @return {*}
     * @memberof ActiveQuery
     */
    pPromise(promise) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield promise;
            return this.getAtt(result);
        });
    }
    /**
     *
     *
     * @private
     * @param {*} result
     * @return {*}
     * @memberof ActiveQuery
     */
    getAtt(result) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.queryType === Query.DELETE) {
                return yield this.afterDelete(result.affectedRows > 0 ? true : false);
            }
            else if (this.queryType === Query.UPDATE) {
                if (result.affectedRows === 0) {
                    return false;
                }
                this.swapOldAtteribute();
                // this.load({ id: this.primaryKey, ...this.getAttributes() });
                this.isEmpty = false;
                this.isNew = false;
                return this.afterSave(Query.UPDATE);
            }
            else if (this.queryType === Query.INSERT) {
                if (!result.hasOwnProperty('insertId')) {
                    return false;
                }
                this.primaryKey = result.insertId;
                this.swapOldAtteribute();
                this.load(Object.assign({ id: this.primaryKey }, this.getAttributes()));
                this.isEmpty = false;
                this.isNew = false;
                yield this.afterSave(Query.INSERT);
                return true;
            }
            if (result.length === 0) {
                if (this.asModelFlag) {
                    this.isEmpty = true;
                    return this.isAll ? new ListModel() : null;
                }
                else {
                    return this.isAll ? new ListModel() : null;
                }
            }
            if (this.isCustomColumn) {
                if (!this.isAll) {
                    return result[0];
                }
                const res = new ListModel();
                res.addAll(result);
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
            }
            else {
                for (const ky of result) {
                    const model = new this.constructor(this.tableName);
                    model.scenario = this.scenario;
                    model.getMyRow(ky, true);
                    for (const [name, mod] of this.joinOne) {
                        const m = new mod();
                        model[name] = m.getMyRow(ky, true);
                    }
                    output.push(model);
                }
            }
            joinTable.setResult(output);
            if (this.isAll) {
                return joinTable.getResult().then((r) => {
                    return this.getGlueBuild(r);
                }).then((r) => {
                    if (this.toListFlag) {
                        const allModel = new ListModel();
                        allModel.addAll(r);
                        return allModel;
                    }
                    return r;
                });
            }
            this.isEmpty = false;
            return joinTable.getResult().then((r) => {
                return this.getGlueBuild(r);
            }).then(r => r[0]);
        });
    }
    /**
     *
     *
     * @private
     * @param {string} query
     * @return {*}
     * @memberof ActiveQuery
     */
    validateGlue(query) {
        try {
            if (query.toLowerCase().split("select")[1].split("from")[0].includes(this.getMyId()))
                return true;
        }
        catch (err) { }
        return false;
    }
}
export default ActiveQuery;
