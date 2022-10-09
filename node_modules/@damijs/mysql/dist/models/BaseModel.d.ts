import IActiveModel from './IActiveModel';
import { IAttribute } from './IRules';
import QueryBuild from './QueryBuild';
/**
 *
 *
 * @abstract
 * @class BaseModel
 * @implements {IActiveModel}
 */
declare abstract class BaseModel implements IActiveModel {
    [x: string]: any;
    protected tableName: string;
    private _oldAttributes;
    private _attributes;
    private _attributeName;
    protected asModelFlag: boolean;
    protected primaryKey: number;
    private _errorFlag;
    private _errorMessages;
    isEmpty: boolean;
    protected isCustomColumn: boolean;
    protected customAttributes: string[];
    toListFlag: boolean;
    protected scenario: string;
    ['constructor']: any;
    constructor();
    protected init(): void;
    /**
     *
     *
     * @param {boolean} [all=true]
     * @return {*}  {string[]}
     * @memberof BaseModel
     */
    getAttName(all?: boolean): string[];
    /**
     *
     *
     * @param {string} key
     * @param {string} message
     * @memberof BaseModel
     */
    addError(key: string, message: string): void;
    /**
     *
     *
     * @memberof BaseModel
     */
    resetErrors(): void;
    /**
     *
     *
     * @param {string} scenario
     * @memberof BaseModel
     */
    setScenario(scenario: string): void;
    /**
     *
     *
     * @return {*}
     * @memberof BaseModel
     */
    getScenario(): string;
    /**
     *
     *
     * @return {*}  {Promise<boolean>}
     * @memberof BaseModel
     */
    validate(): Promise<boolean>;
    /**
     *
     *
     * @return {*}  {boolean}
     * @memberof BaseModel
     */
    hasError(): boolean;
    /**
     *
     *
     * @return {*}  {object}
     * @memberof BaseModel
     */
    getErrors(): object;
    /**
     *
     *
     * @param {string} attribute
     * @return {*}  {string[]}
     * @memberof BaseModel
     */
    getError(attribute: string): string[];
    /**
     *
     *
     * @param {object} value
     * @return {*}  {object}
     * @memberof BaseModel
     */
    filterAttribute(value: object): object;
    /**
     *
     *
     * @param {QueryBuild} build
     * @return {*}  {this}
     * @memberof BaseModel
     */
    setBuild(build: QueryBuild): this;
    /**
     *
     *
     * @return {*}  {object}
     * @memberof BaseModel
     */
    attributeType(): object;
    /**
     *
     *
     * @param {boolean} flag
     * @return {*}  {IActiveModel}
     * @memberof BaseModel
     */
    toList(flag: boolean): IActiveModel;
    /**
     *
     *
     * @return {*}  {object}
     * @memberof BaseModel
     */
    _getAttributes(): object;
    /**
     *
     *
     * @return {*}  {object}
     * @memberof BaseModel
     */
    getOldAttributes(): object;
    /**
     *
     *
     * @param {Function} callBack
     * @return {*}  {IActiveModel}
     * @memberof BaseModel
     */
    onResult(callBack: Function): IActiveModel;
    /**
     *
     *
     * @param {Function} callBack
     * @return {*}  {IActiveModel}
     * @memberof BaseModel
     */
    onError(callBack: Function): IActiveModel;
    /**
     *
     *
     * @param {string[]} columns
     * @param {((string | number)[][])} record
     * @return {*}  {Promise<any>}
     * @memberof BaseModel
     */
    insertAll(columns: string[], record: (string | number)[][]): Promise<any>;
    deleteAll(condition?: object): Promise<boolean>;
    updateAll(record: object, condition?: object): Promise<boolean>;
    save(): Promise<boolean>;
    delete(id: number | string): Promise<boolean>;
    update(id: string | number): Promise<boolean>;
    findOne(id: string | number): Promise<any>;
    find(callback?: Function): IActiveModel;
    one(): Promise<any>;
    all(): Promise<any>;
    findAll(): Promise<any>;
    asObject(): IActiveModel;
    asModel(): IActiveModel;
    load(attributes: object): boolean;
    getAttributes(): object;
    toJson(): object;
    setHasMany(many: any[]): IActiveModel;
    protected beforeSave(type: string): Promise<Boolean>;
    protected afterSave(type: string): Promise<Boolean>;
    protected beforeDelete(): Promise<Boolean>;
    protected afterDelete(flag: Boolean): Promise<Boolean>;
    protected getModal(callBack: (e: IActiveModel) => any): any;
    protected getSelectAs(): string[];
    protected getMyId(): string;
    /**
     *
     *
     * @protected
     * @param {object} row
     * @param {boolean} [isModal]
     * @return {*}
     * @memberof BaseModel
     */
    protected getMyRow(row: object, isModal?: boolean): {};
    /**
     * reset model to initial state
     *
     * @return {*}
     * @memberof BaseModel
     */
    reset(): any;
    /**
     * check model attribute are loaded
     *
     * @return {*}  {boolean}
     * @memberof BaseModel
     */
    isLoaded(): boolean;
    /**
     *get current class name
     *
     * @return {*}  {string}
     * @memberof BaseModel
     */
    getClassName(): string;
    /**
     *
     *
     * @protected
     * @param {(string[] | object)} list
     * @memberof BaseModel
     */
    protected checkColumn(list: string[] | object): void;
    /**
     *
     *
     * @protected
     * @param {object} [condition]
     * @return {*}
     * @memberof BaseModel
     */
    protected getDelete(condition?: object): any[];
    /**
     *
     *
     * @protected
     * @param {(string | any)} query
     * @param {object} condition
     * @return {*}
     * @memberof BaseModel
     */
    protected addCondition(query: string | any, condition: object): any[];
    /**
     *
     *
     * @protected
     * @param {object} record
     * @param {object} [condition]
     * @return {*}  {((string | string[])[])}
     * @memberof BaseModel
     */
    protected getUpdate(record: object, condition?: object): (string | string[])[];
    /**
     *
     *
     * @protected
     * @memberof BaseModel
     */
    protected swapOldAtteribute(): void;
    /**
     * get value of given attribute
     *
     * @param {string} key
     * @return {*}
     * @memberof BaseModel
     */
    getValue(key: string): any;
    /**
     * set value of specific attribute
     *
     * @param {string} key
     * @param {(string | number)} value
     * @memberof BaseModel
     */
    setValue(key: string, value: string | number): void;
    /**
     * get old value of specific attribute
     *
     * @param {*} key
     * @return {*}
     * @memberof BaseModel
     */
    getOldValue(key: any): any;
    /**
     *
     *
     * @protected
     * @memberof BaseModel
     */
    protected readOnly: () => string[];
    /**
     *
     *
     * @protected
     * @memberof BaseModel
     */
    protected fields: () => any;
    /**
     *
     *
     * @protected
     * @memberof BaseModel
     */
    protected rules: () => IAttribute;
    /**
     * get current table name
     *
     * @return {*}
     * @memberof BaseModel
     */
    getTable(): string;
    protected successCallback: (res: object) => any;
    protected errorCallback: (err: Error) => any;
    protected visibility: () => {};
}
export default BaseModel;
