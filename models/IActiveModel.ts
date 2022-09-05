import QueryBuild from './QueryBuild';

export default interface IActiveModel {
  [x: string]: any;

  isEmpty: boolean;

  getTable(): string;
  filterAttribute(value: object): object;
  attributeType(): object;
  validate(): Promise<boolean>;
  hasError(): boolean;
  addError(key: string, message: string): void;
  getErrors(): object;
  getError(attribute: string): string[];
  setBuild(build: QueryBuild): this;
  toList(flag: boolean): IActiveModel;
  setHasMany(many: any[]): IActiveModel;
  reset(): IActiveModel;
  /* tslint:disable:ban-types */
  onResult(callBack: Function): IActiveModel;
  /* tslint:disable:ban-types */
  onError(callBack: Function): IActiveModel;
  insertAll(columns: string[], record: (number | string)[][]): Promise<any>;
  deleteAll(condition?: object): Promise<boolean>;
  updateAll(record: object, condition?: object): Promise<boolean>;
  save(): Promise<boolean>;
  delete(id: number | string): Promise<boolean>;
  update(id: number | string): Promise<boolean>;
  findOne(id: number | string): Promise<any>;
  /* tslint:disable:ban-types */
  find(callback?: Function): IActiveModel;
  one(): Promise<any>;
  all(): Promise<any>;
  findAll(): Promise<any>;
  asObject(flag?: boolean): IActiveModel;
  asModel(flag?: boolean): IActiveModel;
  load(attributes: object): boolean;
  isLoaded(): boolean;
  getAttributes(): object;
  getOldAttributes(): object;
  getValue(key: string): number | string;
  setValue(key: string, value: string | number): void;
  getOldValue(key: string): number | string;
  toJson(): object;
  // rules: ruleFunction
}
