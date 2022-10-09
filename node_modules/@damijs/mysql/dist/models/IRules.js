var RuleType;
(function (RuleType) {
    RuleType["STRING"] = "string";
    RuleType["NUMBER"] = "number";
    RuleType["LENGTH"] = "length";
    RuleType["EMAIL"] = "email";
    RuleType["UNIQUE"] = "unique";
    RuleType["REQUIRED"] = "required";
    RuleType["MATCH"] = "match";
    RuleType["PATTERN"] = "pattern";
    RuleType["CALLBACK"] = "callback";
    RuleType["ONEOF"] = "oneof";
    RuleType["MIN"] = "min";
    RuleType["MAX"] = "max";
    RuleType["EQUAL"] = "equal";
    RuleType["PHONE"] = "phone";
})(RuleType || (RuleType = {}));
var RuleConst;
(function (RuleConst) {
    RuleConst["ONEOFVALUE"] = "oneofvalue";
    RuleConst["RULE"] = "rule";
    RuleConst["MESSAGE"] = "message";
})(RuleConst || (RuleConst = {}));
const DataType = [RuleType.STRING, RuleType.NUMBER];
const StringRule = [RuleType.STRING, RuleType.NUMBER, RuleType.EMAIL, RuleType.REQUIRED, RuleType.UNIQUE];
const ObjectRule = [RuleType.MATCH, RuleType.PATTERN, RuleType.CALLBACK, RuleType.LENGTH, RuleType.ONEOF];
const AllowedRuleList = [...StringRule, ...ObjectRule];
export { RuleType, RuleConst, AllowedRuleList, StringRule, ObjectRule, DataType };
