export default (conf = { len: 5, saperator: '-' }) => {
    // 65 to 90. ASCII value of lowercase alphabets – 97 to 122. ASCII value of UPPERCASE alphabets
    const rndlst = [];
    for (let i = conf.len; i > 0; i--) {
        const rand = [];
        for (let j = 2; j > 0; j--) {
            rand.push(String.fromCharCode(Math.floor(Math.random() * 25) + 65));
            rand.push(Math.floor(Math.random() * 9));
            rand.push(String.fromCharCode(Math.floor(Math.random() * 25) + 97));
        }
        rndlst.push(rand.join(''));
    }
    return rndlst.join(conf.saperator);
};
