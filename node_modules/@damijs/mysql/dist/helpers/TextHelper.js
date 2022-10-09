export function camelToText(str) {
    return str.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, ' $1');
}
