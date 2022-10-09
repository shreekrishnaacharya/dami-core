var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { chkat } from './_validate';
/**
 *
 *
 * @abstract
 * @class BaseModel
 * @implements {IActiveModel}
 */
class BaseModel {
    /* tslint:disable:no-empty */
    constructor() {
        this._oldAttributes = {};
        this._attributes = {};
        this._attributeName = [];
        this.asModelFlag = true;
        this._errorFlag = false;
        this._errorMessages = {};
        this.isEmpty = true;
        this.isCustomColumn = false;
        this.customAttributes = [];
        this.toListFlag = true;
        this.scenario = 'DEFAULT';
        /**
         *
         *
         * @protected
         * @memberof BaseModel
         */
        this.readOnly = () => {
            return ['*'];
        };
        /**
         *
         *
         * @protected
         * @memberof BaseModel
         */
        this.fields = () => {
            return null;
        };
        /**
         *
         *
         * @protected
         * @memberof BaseModel
         */
        this.rules = () => {
            return null;
        };
        this.successCallback = (res) => { return null; };
        this.errorCallback = (err) => { return null; };
        this.visibility = () => {
            return {};
        };
    }
    init() {
        const attributes = this.rules();
        this._validate = {};
        if (attributes === null) {
            throw new Error("'rules' method cannot be empty");
        }
        for (const attr of Object.keys(attributes)) {
            if (attr in this) {
                this.customAttributes.push(attr);
            }
            else {
                this._attributeName.push(attr);
            }
            this._validate[attr] = chkat(attr, attributes[attr]);
        }
    }
    /**
     *
     *
     * @param {boolean} [all=true]
     * @return {*}  {string[]}
     * @memberof BaseModel
     */
    getAttName(all = true) {
        if (all) {
            return [...this._attributeName, ...this.customAttributes];
        }
        return this._attributeName;
    }
    /**
     *
     *
     * @param {string} key
     * @param {string} message
     * @memberof BaseModel
     */
    addError(key, message) {
        this._errorFlag = true;
        if (!(key in this._errorMessages)) {
            this._errorMessages[key] = [];
        }
        this._errorMessages[key].push(message);
    }
    /**
     *
     *
     * @memberof BaseModel
     */
    resetErrors() {
        this._errorFlag = false;
        this._errorMessages = {};
    }
    /**
     *
     *
     * @param {string} scenario
     * @memberof BaseModel
     */
    setScenario(scenario) {
        this.scenario = scenario;
    }
    /**
     *
     *
     * @return {*}
     * @memberof BaseModel
     */
    getScenario() {
        return this.scenario;
    }
    /**
     *
     *
     * @return {*}  {Promise<boolean>}
     * @memberof BaseModel
     */
    validate() {
        throw new Error('Method not implemented.');
    }
    /**
     *
     *
     * @return {*}  {boolean}
     * @memberof BaseModel
     */
    hasError() {
        return !this._errorFlag;
    }
    /**
     *
     *
     * @return {*}  {object}
     * @memberof BaseModel
     */
    getErrors() {
        return this._errorMessages;
    }
    /**
     *
     *
     * @param {string} attribute
     * @return {*}  {string[]}
     * @memberof BaseModel
     */
    getError(attribute) {
        if (attribute in this._errorMessages) {
            return this._errorMessages[attribute];
        }
        return [];
    }
    /**
     *
     *
     * @param {object} value
     * @return {*}  {object}
     * @memberof BaseModel
     */
    filterAttribute(value) {
        throw new Error('Method not implemented.');
    }
    /**
     *
     *
     * @param {QueryBuild} build
     * @return {*}  {this}
     * @memberof BaseModel
     */
    setBuild(build) {
        throw new Error('Method not implemented.');
    }
    /**
     *
     *
     * @return {*}  {object}
     * @memberof BaseModel
     */
    attributeType() {
        throw new Error('Method not implemented.');
    }
    /**
     *
     *
     * @param {boolean} flag
     * @return {*}  {IActiveModel}
     * @memberof BaseModel
     */
    toList(flag) {
        this.toListFlag = flag;
        return this;
    }
    /**
     *
     *
     * @return {*}  {object}
     * @memberof BaseModel
     */
    _getAttributes() {
        return this._attributes;
    }
    /**
     *
     *
     * @return {*}  {object}
     * @memberof BaseModel
     */
    getOldAttributes() {
        return this._oldAttributes;
    }
    /**
     *
     *
     * @param {Function} callBack
     * @return {*}  {IActiveModel}
     * @memberof BaseModel
     */
    onResult(callBack) {
        throw new Error('Method not implemented.');
    }
    /**
     *
     *
     * @param {Function} callBack
     * @return {*}  {IActiveModel}
     * @memberof BaseModel
     */
    onError(callBack) {
        throw new Error('Method not implemented.');
    }
    /**
     *
     *
     * @param {string[]} columns
     * @param {((string | number)[][])} record
     * @return {*}  {Promise<any>}
     * @memberof BaseModel
     */
    insertAll(columns, record) {
        throw new Error('Method not implemented.');
    }
    deleteAll(condition) {
        throw new Error('Method not implemented.');
    }
    updateAll(record, condition) {
        throw new Error('Method not implemented.');
    }
    save() {
        throw new Error('Method not implemented.');
    }
    delete(id) {
        throw new Error('Method not implemented.');
    }
    update(id) {
        throw new Error('Method not implemented.');
    }
    findOne(id) {
        throw new Error('Method not implemented.');
    }
    /* tslint:disable:ban-types */
    find(callback) {
        throw new Error('Method not implemented.');
    }
    one() {
        throw new Error('Method not implemented.');
    }
    all() {
        throw new Error('Method not implemented.');
    }
    findAll() {
        throw new Error('Method not implemented.');
    }
    asObject() {
        throw new Error('Method not implemented.');
    }
    asModel() {
        throw new Error('Method not implemented.');
    }
    load(attributes) {
        throw new Error('Method not implemented.');
    }
    getAttributes() {
        throw new Error('Method not implemented.');
    }
    toJson() {
        throw new Error('Method not implemented.');
    }
    setHasMany(many) {
        throw new Error('Method not implemented.');
    }
    beforeSave(type) {
        return __awaiter(this, void 0, void 0, function* () { return Promise.resolve(true); });
    }
    afterSave(type) { return Promise.resolve(true); }
    beforeDelete() {
        return __awaiter(this, void 0, void 0, function* () { return Promise.resolve(true); });
    }
    afterDelete(flag) { return Promise.resolve(flag); }
    getModal(callBack) {
        return callBack(this);
    }
    getSelectAs() {
        return this._attributeName.map((name) => {
            return `${this.tableName}.${name} as _${this.tableName}_${name}`;
        });
    }
    getMyId() {
        return `_${this.tableName}_id`;
    }
    /**
     *
     *
     * @protected
     * @param {object} row
     * @param {boolean} [isModal]
     * @return {*}
     * @memberof BaseModel
     */
    getMyRow(row, isModal) {
        let hasValue = false;
        if (isModal) {
            this._attributeName.forEach((name) => {
                if (row.hasOwnProperty(`_${this.tableName}_${name}`)) {
                    this._attributes[name] = row[`_${this.tableName}_${name}`];
                    this[name] = this._attributes[name];
                    this.isEmpty = false;
                    if (row[`_${this.tableName}_${name}`] != null) {
                        hasValue = true;
                    }
                }
            });
            this._oldAttributes = Object.assign({}, this._attributes);
            return hasValue ? this : null;
        }
        const result = {};
        if (row === null) {
            return null;
        }
        this._attributeName.forEach((name) => {
            if (row.hasOwnProperty(`_${this.tableName}_${name}`)) {
                result[name] = row[`_${this.tableName}_${name}`];
                if (row[`_${this.tableName}_${name}`] != null) {
                    hasValue = true;
                }
            }
        });
        return hasValue ? result : null;
    }
    /**
     * reset model to initial state
     *
     * @return {*}
     * @memberof BaseModel
     */
    reset() {
        return Object.assign(this, new this.constructor());
    }
    /**
     * check model attribute are loaded
     *
     * @return {*}  {boolean}
     * @memberof BaseModel
     */
    isLoaded() {
        return Object.keys(this._attributes).length !== 0;
    }
    /**
     *get current class name
     *
     * @return {*}  {string}
     * @memberof BaseModel
     */
    getClassName() {
        return this.constructor.name;
    }
    /**
     *
     *
     * @protected
     * @param {(string[] | object)} list
     * @memberof BaseModel
     */
    checkColumn(list) {
        if (Array.isArray(list)) {
            list.forEach((val) => {
                if (!this._attributeName.includes(val)) {
                    throw new Error(`Column '${val}' does not exist in model ${this.getClassName()}`);
                }
            });
        }
        else {
            Object.keys(list).forEach((val) => {
                if (!this._attributeName.includes(val)) {
                    throw new Error(`Column '${val}' does not exist in model ${this.getClassName()}`);
                }
            });
        }
    }
    /**
     *
     *
     * @protected
     * @param {object} [condition]
     * @return {*}
     * @memberof BaseModel
     */
    getDelete(condition) {
        return this.addCondition(`DELETE FROM ${this.tableName}`, condition);
    }
    /**
     *
     *
     * @protected
     * @param {(string | any)} query
     * @param {object} condition
     * @return {*}
     * @memberof BaseModel
     */
    addCondition(query, condition) {
        if (Object.keys(condition).length > 0) {
            let condQery = query;
            const values = [];
            condQery += ' WHERE ';
            for (const ky of Object.keys(condition)) {
                condQery += ky + '=? AND ';
                values.push(condition[ky]);
            }
            condQery = condQery.slice(0, -4);
            return [condQery, values];
        }
        return [query, []];
    }
    /**
     *
     *
     * @protected
     * @param {object} record
     * @param {object} [condition]
     * @return {*}  {((string | string[])[])}
     * @memberof BaseModel
     */
    getUpdate(record, condition) {
        let condQery = `UPDATE ${this.tableName}`;
        const values = [];
        if (Object.keys(record).length > 0) {
            condQery += ' SET ';
            for (const ky of Object.keys(record)) {
                condQery += ky + '=?,';
                values.push(record[ky]);
            }
            condQery = condQery.slice(0, -1);
        }
        const [query, cond] = this.addCondition(condQery, condition);
        return [query, [...values, ...cond]];
    }
    /**
     *
     *
     * @protected
     * @memberof BaseModel
     */
    swapOldAtteribute() {
        this._oldAttributes = Object.assign({}, this._attributes);
    }
    /**
     * get value of given attribute
     *
     * @param {string} key
     * @return {*}
     * @memberof BaseModel
     */
    getValue(key) {
        const attr = this.getAttName();
        if (attr.indexOf(key) < 0) {
            throw new Error(`Property not found : ${key}`);
        }
        return this._attributes[key];
    }
    /**
     * set value of specific attribute
     *
     * @param {string} key
     * @param {(string | number)} value
     * @memberof BaseModel
     */
    setValue(key, value) {
        const attr = this.getAttName();
        if (attr.indexOf(key) < 0) {
            throw new Error(`Property not found : ${key}`);
        }
        this[key] = value;
        this._attributes[key] = value;
    }
    /**
     * get old value of specific attribute
     *
     * @param {*} key
     * @return {*}
     * @memberof BaseModel
     */
    getOldValue(key) {
        if (this._attributeName.indexOf(key) < 0) {
            return null;
            // throw new Error(`Property not found : ${key}`);
        }
        return this._oldAttributes[key];
    }
    /**
     * get current table name
     *
     * @return {*}
     * @memberof BaseModel
     */
    getTable() {
        return this.tableName;
    }
}
export default BaseModel;
