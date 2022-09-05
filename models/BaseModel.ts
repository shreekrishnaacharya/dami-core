import IActiveModel from './IActiveModel';
import { IAttribute } from './IRules';
import QueryBuild from './QueryBuild';
import { chkat } from './_validate';

abstract class BaseModel implements IActiveModel {
  [x: string]: any;
  protected tableName: string;
  private _oldAttributes: object = {};
  private _attributes: object = {};
  private _attributeName: string[] = [];
  protected asModelFlag: boolean = true;
  protected primaryKey: number;
  private _errorFlag: boolean = false;
  private _errorMessages: object = {};
  public isEmpty: boolean = true;
  protected isCustomColumn: boolean = false;
  protected customAttributes: string[] = [];
  public toListFlag: boolean = true;
  protected scenario: string = 'DEFAULT';

  ['constructor'];
  /* tslint:disable:no-empty */
  constructor() {
  }


  protected init() {
    const attributes = this.rules();
    this._validate = {};
    if (attributes === null) {
      throw new Error("'rules' method cannot be empty");
    }
    for (const attr of Object.keys(attributes)) {
      if (attr in this) {
        this.customAttributes.push(attr);
      } else {
        this._attributeName.push(attr);
      }
      this._validate[attr] = chkat(attr, attributes[attr]);
    }
  }
  getAttName(all: boolean = true): string[] {
    if (all) {
      return [...this._attributeName, ...this.customAttributes];
    }
    return this._attributeName;
  }
  addError(key: string, message: string): void {
    this._errorFlag = true;
    if (!(key in this._errorMessages)) {
      this._errorMessages[key] = [];
    }
    this._errorMessages[key].push(message);
  }
  resetErrors() {
    this._errorFlag = false;
    this._errorMessages = {};
  }
  setScenario(scenario: string) {
    this.scenario = scenario;
  }
  getScenario() {
    return this.scenario;
  }
  validate(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  hasError(): boolean {
    return !this._errorFlag;
  }
  getErrors(): object {
    return this._errorMessages;
  }
  getError(attribute: string): string[] {
    if (attribute in this._errorMessages) {
      return this._errorMessages[attribute];
    }
    return [];
  }
  filterAttribute(value: object): object {
    throw new Error('Method not implemented.');
  }
  setBuild(build: QueryBuild): this {
    throw new Error('Method not implemented.');
  }
  attributeType(): object {
    throw new Error('Method not implemented.');
  }
  toList(flag: boolean): IActiveModel {
    this.toListFlag = flag;
    return this;
  }
  _getAttributes(): object {
    return this._attributes;
  }

  getOldAttributes(): object {
    return this._oldAttributes;
  }

  /* tslint:disable:ban-types */
  onResult(callBack: Function): IActiveModel {
    throw new Error('Method not implemented.');
  }
  /* tslint:disable:ban-types */
  onError(callBack: Function): IActiveModel {
    throw new Error('Method not implemented.');
  }
  insertAll(columns: string[], record: (string | number)[][]): Promise<any> {
    throw new Error('Method not implemented.');
  }
  deleteAll(condition?: object): Promise<any> {
    throw new Error('Method not implemented.');
  }
  updateAll(record: object, condition?: object): Promise<any> {
    throw new Error('Method not implemented.');
  }
  save(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  delete(id: number | string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  update(id: string | number): Promise<any> {
    throw new Error('Method not implemented.');
  }
  findOne(id: string | number): Promise<any> {
    throw new Error('Method not implemented.');
  }
  /* tslint:disable:ban-types */
  find(callback?: Function): IActiveModel {
    throw new Error('Method not implemented.');
  }
  one(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  all(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  findAll(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  asObject(): IActiveModel {
    throw new Error('Method not implemented.');
  }
  asModel(): IActiveModel {
    throw new Error('Method not implemented.');
  }
  load(attributes: object): boolean {
    throw new Error('Method not implemented.');
  }
  getAttributes(): object {
    throw new Error('Method not implemented.');
  }

  toJson(): object {
    throw new Error('Method not implemented.');
  }
  setHasMany(many: any[]): IActiveModel {
    throw new Error('Method not implemented.');
  }

  protected async beforeSave(type: string): Promise<Boolean> { return Promise.resolve(true) }
  protected afterSave(type: string): Promise<Boolean> { return Promise.resolve(true) }
  protected async beforeDelete(): Promise<Boolean> { return Promise.resolve(true) }
  protected afterDelete(flag: Boolean): Promise<Boolean> { return Promise.resolve(flag) }
  protected getModal(callBack: (e: IActiveModel) => any) {
    return callBack(this);
  }
  protected getSelectAs(): string[] {
    return this._attributeName.map((name) => {
      return `${this.tableName}.${name} as _${this.tableName}_${name}`;
    });
  }
  protected getMyId() {
    return `_${this.tableName}_id`;
  }
  protected getMyRow(row: object, isModal?: boolean) {
    if (isModal) {
      this._attributeName.forEach((name) => {
        if (row.hasOwnProperty(`_${this.tableName}_${name}`)) {
          this._attributes[name] = row[`_${this.tableName}_${name}`];
          this[name] = this._attributes[name];
          this.isEmpty = false;
        }
      });
      this._oldAttributes = { ...this._attributes };
      return this;
    }
    const result = {};
    if (row === null) {
      return {};
    }
    this._attributeName.forEach((name) => {
      if (row.hasOwnProperty(`_${this.tableName}_${name}`)) {
        result[name] = row[`_${this.tableName}_${name}`];
      }
    });
    return result;
  }
  reset() {
    return Object.assign(this, new this.constructor());
  }
  isLoaded() {
    return Object.keys(this._attributes).length !== 0;
  }
  getClassName() {
    return this.constructor.name;
  }
  protected checkColumn(list: string[] | object) {
    if (Array.isArray(list)) {
      list.forEach((val) => {
        if (!this._attributeName.includes(val)) {
          throw new Error(`Column '${val}' does not exist in model ${this.getClassName()}`);
        }
      });
    } else {
      Object.keys(list).forEach((val) => {
        if (!this._attributeName.includes(val)) {
          throw new Error(`Column '${val}' does not exist in model ${this.getClassName()}`);
        }
      });
    }
  }

  protected getDelete(condition?: object) {
    return this.addCondition(`DELETE FROM ${this.tableName}`, condition);
  }
  protected addCondition(query: string | any, condition: object) {
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

  protected getUpdate(record: object, condition?: object): (string | string[])[] {
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

  protected swapOldAtteribute() {
    this._oldAttributes = { ...this._attributes };
  }

  getValue(key: string) {
    const attr = this.getAttName();
    if (attr.indexOf(key) < 0) {
      throw new Error(`Property not found : ${key}`);
    }
    return this._attributes[key];
  }
  setValue(key: string, value: string | number) {
    const attr = this.getAttName();
    if (attr.indexOf(key) < 0) {
      throw new Error(`Property not found : ${key}`);
    }
    this[key] = value
    this._attributes[key] = value;
  }
  getOldValue(key: any) {
    if (this._attributeName.indexOf(key) < 0) {
      return null;
      // throw new Error(`Property not found : ${key}`);
    }
    return this._oldAttributes[key];
  }

  protected readOnly = () => {
    return ['*'];
  };
  protected fields = () => {
    return null;
  };
  protected rules = (): IAttribute => {
    return null;
  };
  getTable() {
    return this.tableName;
  }
  protected successCallback = (res: object) => { return null };
  protected errorCallback = (err: Error) => { return null };
  protected visibility = () => {
    return {};
  };
}

export default BaseModel;
