var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { isEmpty } from '../helpers/functions';
import ListModel from '../helpers/ListModel';
import ActiveQuery from './ActiveQuery';
import BaseModel from './BaseModel';
import { DataType, RuleType } from './IRules';
import { checkRules } from './_validate';
/**
 *
 *
 * @abstract
 * @class ActiveRecords
 * @extends {ActiveQuery}
 */
class ActiveRecords extends ActiveQuery {
    constructor(tableName) {
        super();
        this.tableName = tableName;
    }
    /**
     * check if the loaded data are valid
     * @returns : true on validate, false on error
     */
    validate() {
        return new Promise((resolve, reject) => {
            const _val = this._validate;
            const visi = this.visibility();
            const _attrValue = this.getAttributes(true);
            let visible = [];
            if (this.scenario in visi) {
                visible = visi[this.scenario];
            }
            else {
                visible = this.getAttName();
            }
            this.resetErrors();
            for (const check of Object.keys(_val)) {
                if (visible.indexOf(check) > -1) {
                    this._validate[check] = checkRules(check, _val[check], _attrValue);
                    if (this._validate[check].error) {
                        this.addError(check, this._validate[check].errorMessage);
                    }
                }
            }
            resolve(this.hasError());
        });
    }
    /**
     * filter the loaded value againse model attribute,
     * remove all data that does not exist in model attribute
     * @param value : object to be filter
     * @returns : valid attributes
     */
    filterAttribute(value) {
        const val = {};
        this.getAttName().forEach((e) => {
            if (e in value) {
                val[e] = value[e];
            }
        });
        return val;
    }
    attributeType() {
        const rules = this.rules();
        const rule = {};
        Object.keys(rules).forEach(e => {
            let type = RuleType.STRING;
            DataType.forEach(f => {
                if (rules[e].includes(f)) {
                    type = f;
                }
            });
            rule[e] = type;
        });
        return rule;
    }
    /**
     * return all visiable fields on current scenario
     * @param value : field to be filter
     * @returns : visiable fields
     */
    getVisibleFields(value) {
        const visible = this.visibility();
        let fields = this.getAttName();
        if (this.scenario in visible) {
            fields = visible[this.scenario];
        }
        else if (this.fields() !== null) {
            return value;
        }
        let flist = {};
        fields.forEach(e => {
            if (e in value) {
                flist[e] = value[e];
            }
        });
        return flist;
    }
    /**
     * get all attributes of current model
     * @param all : on true, includes custom attributes
     * @returns : attributed of current model
     */
    getAttributes(all = false) {
        const result = Object.assign({}, this._getAttributes());
        if (all) {
            for (const arr of this.customAttributes) {
                result[arr] = this[arr];
            }
        }
        return result;
    }
    /**
     * load all value to respective attribute
     * @param attributes : attributes to be loaded
     * @returns : true on load, false if supplied attribute does not contains any attribute of model
     */
    load(attributes) {
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
                this.setValue(key, attributes[key]);
                this[key] = attributes[key];
                isLoaded = true;
                this.isEmpty = false;
            }
        }
        return isLoaded;
    }
    /**
     * converts the model attribute value to json
     * @returns : json with model attribute values
     */
    toJson() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isEmpty) {
                return {};
            }
            if (this.fields() === null) {
                return this.getVisibleFields(this.getAttributes());
            }
            const fields = this.getVisibleFields(this.fields());
            const fieldList = {};
            for (const field of Object.keys(fields)) {
                if (typeof fields[field] === 'function') {
                    const val = yield fields[field](this);
                    if (val instanceof ListModel || val instanceof BaseModel) {
                        fieldList[field] = yield val.toJson();
                    }
                    else {
                        fieldList[field] = val;
                    }
                }
                else {
                    fieldList[field] = this.getValue(fields[field]);
                }
            }
            return fieldList;
        });
    }
}
export default ActiveRecords;
