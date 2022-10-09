export function PathMatch(path, url) {
    const expression = Match(path);
    const match = expression.exec(url) || false;
    return !!match && match[0] === match.input;
}
export function PathFrom(from, to) {
    const fromList = from.split('/');
    const toList = to.split('/');
    const relativePath = [];
    let counter = 0;
    let flag = true;
    // console.log(from, to);
    fromList.forEach((e) => {
        if (flag) {
            if (e !== toList[counter]) {
                flag = false;
            }
            counter++;
        }
        else {
            relativePath.push('..');
        }
    });
    flag = true;
    toList.forEach((e) => {
        if (flag) {
            if (e !== toList[counter]) {
                flag = false;
                relativePath.push(e);
            }
            counter++;
        }
        else {
            relativePath.push(e);
        }
    });
    return relativePath.join('/');
}
function Match(path) {
    const pattern = path
        // Escape literal dots
        .replace(/\./g, '\\.')
        // Escape literal slashes
        .replace(/\//g, '/')
        // Escape literal question marks
        .replace(/\?/g, '\\?')
        // Ignore trailing slashes
        .replace(/\/+$/, '')
        // Replace wildcard with any zero-to-any character sequence
        .replace(/\*+/g, '.*')
        // Replace parameters with named capturing groups
        .replace(/:([^\d|^\/][a-zA-Z0-9_]*(?=(?:\/|\\.)|$))/g, (_, paramName) => `(?<${paramName}>[^\/]+?)`)
        // Allow optional trailing slash
        .concat('(\\/|$)');
    return new RegExp(pattern, 'gi');
}
