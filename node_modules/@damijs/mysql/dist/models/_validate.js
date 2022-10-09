import { RuleType, RuleConst } from './IRules';
/**
 *
 *
 * @param {string} rul
 * @param {string} name
 * @return {*}
 */
const checkStrRule = (rul, name) => {
    const rule = {
        message: '',
        name: rul,
    };
    switch (rul) {
        case RuleType.REQUIRED:
            rule.message = `{label} is required`;
            break;
        case RuleType.STRING:
            rule.message = `{label} must be string`;
            break;
        case RuleType.NUMBER:
            rule.message = `{label} must be number`;
            break;
        case RuleType.EMAIL:
            rule.message = `{label} is not a valid email`;
            break;
        case RuleType.PHONE:
            rule.message = `{label} is not a valid phone number`;
            break;
        default:
            throw new Error(`Unknown rule type ${rul} for ${name}`);
    }
    return rule;
};
/**
 *
 *
 * @param {*} rul
 * @param {*} name
 * @return {*}
 */
const checkObjRule = (rul, name) => {
    const rule = {
        message: '',
        name,
    };
    if (RuleConst.RULE in rul) {
        rule.name = rul.rule;
        rule.message = `{label} does not match its defination`;
    }
    if (RuleType.MAX in rul) {
        rule[RuleType.MAX] = rul.max;
        rule.name = RuleType.LENGTH;
        rule.message = `Length does not match`;
    }
    if (RuleType.EQUAL in rul) {
        rule[RuleType.EQUAL] = rul.equal;
        rule.name = RuleType.LENGTH;
        rule.message = `Length does not match`;
    }
    if (RuleType.MIN in rul) {
        rule[RuleType.MIN] = rul.min;
        rule.name = RuleType.LENGTH;
        rule.message = `Length does not match`;
    }
    if (RuleType.MATCH in rul) {
        rule[RuleType.MATCH] = rul.match;
        rule.name = RuleType.MATCH;
        rule.message = `{label} does not match with {match}`;
    }
    if (RuleType.CALLBACK in rul) {
        rule[RuleType.CALLBACK] = rul[RuleType.CALLBACK];
        rule.name = RuleType.CALLBACK;
        rule.message = `{label} does not match with its defination`;
    }
    if (RuleType.ONEOF in rul) {
        rule[RuleType.ONEOF] = rul[RuleType.ONEOF];
        rule.name = RuleType.ONEOF;
        if (Array.isArray(rul[RuleType.ONEOF])) {
            rule[RuleConst.ONEOFVALUE] = rul[RuleType.ONEOF];
            rule.message = `{label} must be one of ${rul[RuleType.ONEOF].join(', ')}`;
        }
        else {
            rule[RuleConst.ONEOFVALUE] = Object.keys(rul[RuleType.ONEOF]);
            rule.message = `{label} must be one of ${Object.values(rule[RuleConst.ONEOFVALUE]).join(', ')}`;
        }
    }
    if (RuleType.PATTERN in rul) {
        try {
            /* tslint:disable:no-unused-expression */
            new RegExp(rul.pattern);
        }
        catch (e) {
            throw new Error(`Pattern for ${name} is not a valid Regx`);
        }
        rule[RuleType.PATTERN] = rul.pattern;
        rule.message = `{label} does not match its required format`;
    }
    if (RuleConst.MESSAGE in rul) {
        rule.message = rul.message;
    }
    return rule;
};
/**
 *
 *
 * @param {*} name
 * @param {*} rules
 * @return {*}
 */
const chkat = (name, rules) => {
    const label = name.replace('_', ' ');
    const att = {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        name,
        error: false,
        errorMessage: '',
        rules: [],
    };
    if (Array.isArray(rules)) {
        rules.forEach((val) => {
            switch (typeof val) {
                case 'string':
                    att.rules.push(checkStrRule(val, name));
                    break;
                case 'object':
                    att.rules.push(checkObjRule(val, name));
                    break;
                default:
                    throw new Error(`Not a valid rule defination`);
            }
        });
    }
    return att;
};
const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};
const validatePhone = (phone) => {
    const re = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;
    return re.test(String(phone).toLowerCase());
};
const validateRegx = (value, regx) => {
    return regx.test(String(value).toLowerCase());
};
/**
 *
 *
 * @param {string} name
 * @param {*} _currentAttr
 * @param {*} _attributes
 * @return {*}
 */
const checkRules = (name, _currentAttr, _attributes) => {
    const attr = _currentAttr;
    const _value = _attributes[name];
    const result = Object.assign(Object.assign({}, attr), { error: false, errorMessage: '' });
    const hasRequired = attr.rules.find((e) => e.name === RuleType.REQUIRED);
    const hasValue = !(_value === '' || _value === undefined || _value === null);
    if (hasRequired !== undefined && !hasValue) {
        result.error = true;
        result.errorMessage = attr.rules.find((e) => e.name === RuleType.REQUIRED).message.replace('{label}', attr.label);
        return result;
    }
    if (!hasValue) {
        return result;
    }
    for (const rule of attr.rules) {
        switch (rule.name) {
            case 'required':
                if (_value === '' || _value === undefined || _value === null) {
                    result.error = true;
                }
                break;
            case 'number':
                if (isNaN(_value)) {
                    result.error = true;
                }
                break;
            case 'string':
                if (!isNaN(_value)) {
                    result.error = true;
                }
                break;
            case 'email':
                if (!validateEmail(_value)) {
                    result.error = true;
                }
                break;
            case 'phone':
                if (!validatePhone(_value)) {
                    result.error = true;
                }
                break;
            case 'pattern':
                if (!validateRegx(_value, rule.pattern)) {
                    result.error = true;
                }
                break;
            case 'oneof':
                if (!rule.oneofvalue.includes(_value)) {
                    result.error = true;
                }
                break;
            case 'match':
                const match = _attributes[rule.match];
                if (match.value !== _value) {
                    result.error = true;
                    rule.message = rule.message.replace('{match}', match.label);
                }
                break;
            case 'callback':
                if (!rule.callback(_value)) {
                    result.error = true;
                }
                break;
            case 'length':
                switch (typeof _value) {
                    case 'string':
                        if (rule.hasOwnProperty('max')) {
                            if (_value.length > rule.max) {
                                result.error = true;
                                break;
                            }
                        }
                        if (rule.hasOwnProperty('min')) {
                            if (_value.length < rule.min) {
                                result.error = true;
                                break;
                            }
                        }
                        if (rule.hasOwnProperty('equal')) {
                            if (_value.length !== rule.equal) {
                                result.error = true;
                                break;
                            }
                        }
                        break;
                    case 'number':
                        if (rule.hasOwnProperty('max')) {
                            if (_value > rule.max) {
                                result.error = true;
                                break;
                            }
                        }
                        if (rule.hasOwnProperty('min')) {
                            if (_value < rule.mix) {
                                result.error = true;
                                break;
                            }
                        }
                        if (rule.hasOwnProperty('equal')) {
                            if (_value !== rule.equal) {
                                result.error = true;
                                break;
                            }
                        }
                        break;
                    default:
                        throw new Error(`Invalid rules defination '${rule.name}' for ${attr.label} typeof ${typeof _value}`);
                }
                break;
            default:
                throw new Error(`Invalid rules defination '${rule.name}' for ${attr.label}`);
        }
        if (result.error) {
            result.errorMessage = rule.message.replace('{label}', attr.label);
            break;
        }
        else {
            result.errorMessage = '';
        }
    }
    return result;
};
export { chkat, checkRules };
