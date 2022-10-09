/**
 *
 *
 * @param {*} name
 * @param {*} rules
 * @return {*}
 */
declare const chkat: (name: any, rules: any) => {
    label: any;
    name: any;
    error: boolean;
    errorMessage: string;
    rules: any[];
};
/**
 *
 *
 * @param {string} name
 * @param {*} _currentAttr
 * @param {*} _attributes
 * @return {*}
 */
declare const checkRules: (name: string, _currentAttr: any, _attributes: any) => any;
export { chkat, checkRules };
