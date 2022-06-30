import Dami from '../app/Dami';

class Url {
  static to(path: string, params?: object | (string | number)[], absolute?: boolean) {
    let _url = '/' + path;
    if (Array.isArray(params)) {
      _url += '/' + params.map((e) => (e === null || e === undefined || e === '' ? 'null' : e)).join('/');
    } else if (Object.keys(params).length > 0) {
      _url +=
        '?' +
        Object.keys(params)
          .map((key) => `${key}=${params[key]}`)
          .join('&');
    }
    if (absolute === true) {
      _url = Dami.baseUrl + _url;
    }
    return encodeURI(_url);
  }
}

export default Url;
