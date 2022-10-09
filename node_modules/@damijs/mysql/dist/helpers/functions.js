export const isEmpty = (value) => {
    if (value === null || value === undefined || value === '' || value === 0 || value === false) {
        return true;
    }
    if (typeof value === 'function') {
        return false;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return true;
        }
    }
    else if (typeof value === 'object') {
        if (Object.keys(value).length === 0) {
            return true;
        }
    }
    return false;
};
