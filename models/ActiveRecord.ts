import { isEmpty } from '../helpers/functions';
import ActiveQuery from './ActiveQuery';
import { IAttList } from './IRules';
import { checkRules } from './_validate';

abstract class ActiveRecords extends ActiveQuery {
  public _validate: IAttList;
  constructor(tableName: string) {
    super();
    this.tableName = tableName;
  }

  public validate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const _val = this._validate;
      const visi = this.visibility();
      const _attrValue = this.getAttributes(true);
      let visible = [];
      if (this.scenario in visi) {
        visible = visi[this.scenario];
      } else {
        visible = this.getAttName()
      }
      this.resetErrors()
      for (const check of Object.keys(_val)) {
        if (visible.indexOf(check) > -1) {
          this._validate[check] = checkRules(check, _val[check], _attrValue);
          if (this._validate[check].error) {
            this.addError(check, this._validate[check].errorMessage);
          }
        }
      }
      resolve(this.hasError());
    })
  }

  public filterAttribute(value: object) {
    const val = {};
    this.getAttName().forEach((e) => {
      if (e in value) {
        val[e] = value[e];
      }
    });
    return val;
  }

  public getVisibleFields(value: object) {
    const visible = this.visibility();
    if (!(this.scenario in visible)) {
      return value;
    }
    return this.filterAttribute(visible[this.scenario])
  }

  public getAttributes(all = false) {
    const result = { ...this._getAttributes() };
    if (all) {
      for (const arr of this.customAttributes) {
        result[arr] = this[arr];
      }
    }
    return result;
  }

  load(attributes: object) {
    if (isEmpty(attributes)) {
      return false;
    }
    let isLoaded = false;
    const visible = this.visibility();
    let _attributeName = this.getAttName();
    if (this.scenario in visible) {
      _attributeName = visible[this.scenario];
    }
    for (const key of Object.keys(attributes)) {
      if (_attributeName.indexOf(key) > -1) {
        this.setValue(key, attributes[key])
        this[key] = attributes[key];
        isLoaded = true;
        this.isEmpty = false;
      }
    }
    return isLoaded;
  }



  toJson() {
    if (this.isEmpty) {
      return {};
    }
    if (this.fields() === null) {
      return this.getVisibleFields(this.getAttributes());
    }
    const fields = this.getVisibleFields(this.fields());
    const fieldList = {};
    for (const field in fields) {
      if (typeof fields[field] === 'function') {
        fieldList[field] = fields[field](this);
      } else {
        fieldList[field] = this.getValue(fields[field]);
      }
    }
    return fieldList;
  }
}

export default ActiveRecords;
