enum RuleType {
  STRING = 'string',
  NUMBER = 'number',
  LENGTH = 'length',
  EMAIL = 'email',
  UNIQUE = 'unique',
  REQUIRED = 'required',
  MATCH = 'match',
  PATTERN = 'pattern',
  CALLBACK = 'callback',
  ONEOF = 'oneof',
  MIN = 'min',
  MAX = 'max',
  EQUAL = 'equal',
  PHONE = 'phone'
}
enum RuleConst {
  ONEOFVALUE = 'oneofvalue',
  RULE = 'rule',
  MESSAGE = 'message'
}
interface IAttRule {
  label: string;
  name: string;
  error: boolean;
  errorMessage: string;
  rules: IAttribute[];
}

interface IAttList {
  [propName: string]: IAttRule;
}

interface IAttribute {
  [propName: string]: (SingleRule | IRule | IOneof | IPattern | ILength | IMatch | ICallback | string)[];
}
type SingleRule = RuleType.STRING | RuleType.NUMBER | RuleType.EMAIL | RuleType.REQUIRED | RuleType.UNIQUE;

const StringRule = [RuleType.STRING, RuleType.NUMBER, RuleType.EMAIL, RuleType.REQUIRED, RuleType.UNIQUE];
const ObjectRule = [RuleType.MATCH, RuleType.PATTERN, RuleType.CALLBACK, RuleType.LENGTH, RuleType.ONEOF];
const AllowedRuleList = [...StringRule, ...ObjectRule];

interface IPattern {
  [RuleType.PATTERN]: string;
  message?: string;
}

interface IOneof {
  [RuleType.ONEOF]: (string | number)[] | object;
  message?: string;
}
interface IMatch {
  [RuleType.MATCH]: string;
  message?: string;
}
interface ICallback {
  /* tslint:disable:ban-types */
  [RuleType.CALLBACK]: Function;
  message?: string;
}
interface ILength {
  min?: number;
  max?: number;
  equal?: number;
  message?: string;
}
interface IRule {
  rule: SingleRule;
  message: string;
}
export { RuleType, RuleConst, IAttRule, IAttList, IAttribute, AllowedRuleList, StringRule, ObjectRule };
