import sharp from 'sharp';
import * as _path from 'path';
import Rid from './Rid';
import * as _fs from 'fs';
import Dami from '../app/Dami';

interface ImageConfig {
  name?: string;
  size?: number;
  t_size?: number;
}

class FileHelper {
  private static sap: string = '_@_';
  static getImage(name: string, thumb?: boolean): string | boolean {
    const fname = Buffer.from(name, 'base64').toString('ascii');
    const flist = fname.split(this.sap);
    if (flist.length < 2) {
      return false;
    }
    if (thumb === true) {
      return Dami.getPath(flist[0], 'thumb/' + flist[1]);
    } else {
      return Dami.getPath(flist[0], flist[1]);
    }
  }

  static saveFile(file, path: string, name?: string) {
    // const tpath = path + '/thumb/' + name;
    if (name === undefined) {
      const ext = _path.extname(file.name);
      name = Rid() + ext;
    }
    const _pathAddress = Dami.getPath(path);
    const fname = Buffer.from(path + this.sap + name).toString('base64');
    if (!_fs.existsSync(_pathAddress)) {
      _fs.mkdirSync(_pathAddress);
    }
    if (!_fs.existsSync(_pathAddress + 'thumb/')) {
      _fs.mkdirSync(_pathAddress + 'thumb/');
    }
    return file.mv(name).then((e) => {
      if (e) return false;
      return fname;
    });
  }

  static saveImage(image, path: string, imageConfig?: ImageConfig) {
    const { size, t_size } = imageConfig;
    let { name } = imageConfig;
    const _pathAddress = Dami.getPath(path);
    // const tpath = _pathAddress + '/thumb/' + name;
    if (name === undefined) {
      const ext = _path.extname(image.name);
      name = Rid() + ext;
    }
    const pname = _pathAddress + name;
    const tname = _pathAddress + 'thumb/' + name;

    if (!_fs.existsSync(_pathAddress)) {
      _fs.mkdirSync(_pathAddress);
    }
    if (!_fs.existsSync(_pathAddress + 'thumb/')) {
      _fs.mkdirSync(_pathAddress + 'thumb/');
    }
    const fname = Buffer.from(path + this.sap + name).toString('base64');

    const shar = sharp(image.tempFilePath);
    return shar
      .metadata()
      .then((metadata) => {
        if (size === undefined) {
          shar.toFile(pname);
          return metadata;
        }
        const ratio = metadata.height / metadata.width;
        let height = size;
        let width = size;
        if (ratio > 1) {
          width = null;
        } else {
          height = null;
        }
        shar.resize(width, height).toFile(pname);
        return metadata;
      })
      .then((metadata) => {
        if (t_size === undefined) {
          return metadata;
        }
        const ratio = metadata.height / metadata.width;
        let height = t_size
        let width = t_size;
        if (ratio > 1) {
          width = null;
        } else {
          height = null;
        }
        shar.resize(width, height).toFile(tname);
        return metadata;
      })
      .then(() => {
        return fname;
      });
  }
}

export default FileHelper;
