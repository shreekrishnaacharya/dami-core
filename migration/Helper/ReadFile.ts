import * as _path from 'path';
import * as fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ContentType = {
  file: 'image/png',
  css: 'text/css',
  js: 'text/html',
};
// const __dirname = fs.realpathSync('.');
class ReadFile {
  static index() {
    console.log(__dirname, fs.existsSync(__dirname + '/../resource/client/index.html'));
    return fs.readFileSync(__dirname + '/../resource/client/index.html', 'utf8');
  }
  static readPath(type: string, name: string): string {
    const resPath = __dirname + '/../resource/client/static/' + type + '/' + name;
    if (name === '' || name === undefined || name === null) {
      return "/file/not/found";
    }
    return _path.resolve(resPath);
  }
  static read(type: string, name: string): { type: string; model: string } | boolean {
    const resPath = __dirname + '/../resource/client/static/' + type + '/' + name;

    if (name === '' || name === undefined || name === null) {
      return false;
    }
    console.log(_path.resolve(resPath))
    if (!fs.existsSync(resPath)) {
      console.log('file not found');
      return false;
    }
    // console.log(type,(type in ContentType))
    if (!(type in ContentType)) {
      console.log('type not found');
      return false;
    }
    let model = '';
    let returnType = ContentType.css;
    switch (type) {
      case 'css':
        returnType = ContentType.css;
        model = fs.readFileSync(resPath, 'utf8');
        break;
      case 'js':
        model = fs.readFileSync(resPath, 'utf8');
        returnType = ContentType.js;
        break;
      case 'file':
        model = fs.readFileSync(resPath, 'utf8');
        returnType = ContentType.file;
        break;
    }

    return { type: returnType, model };
  }
}

export default ReadFile;
