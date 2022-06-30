import * as fs from 'fs';
import * as _path from 'path';
import { PathFrom } from '../../helpers/PathMatch';

class ReadCrud {
  tableName: string = '';
  errors: string[] = [];

  getError() {
    return this.errors;
  }
  preview(cName: string, cPath: string, modelPath: string, isMini: string) {
    let overWrite = 0;
    if (!modelPath.includes('@app')) {
      this.errors.push('Invalid model path format');
      return false;
    }
    if (!cPath.includes('@app')) {
      this.errors.push('Invalid controller path format');
      return false;
    }
    const _modelPath = modelPath.replace('@app\\', '').replace(/\\/g, '/') + '.ts';
    if (!fs.existsSync(_modelPath)) {
      this.errors.push("Model '" + modelPath + "' does not exists");
      return false;
    }
    const controllerPath = cPath.replace('@app\\', '').replace(/\\/g, '/') + cName + '.ts';
    if (fs.existsSync(controllerPath)) {
      overWrite = 1;
    }
    return {
      isNew: overWrite,
      path: cPath + cName + '.ts',
      date: new Date().getFullYear(),
      code: btoa(cName + '_&_' + cPath + '_&_' + modelPath + '_&_' + isMini),
    };
  }

  async create(code: string, isCreate: boolean) {
    let commandString = '';

    try {
      const [cName, cPath, modelPath, isMini] = atob(code).split('_&_');
      const _modelPath = modelPath.replace('@app\\', '').replace(/\\/g, '/');
      const modelName = _modelPath.split('/').pop();
      const filePath = cPath.replace('@app\\', '').replace(/\\/g, '/');

      const _modelPathName = PathFrom(filePath, _modelPath);

      let template = 'controller.txt';
      if (isMini === '1') {
        template = 'controller_mini.txt';
      }
      let model = fs.readFileSync(__dirname + '/../resource/template/' + template, 'utf8');
      model = model
        .replace(new RegExp('{{@modelName}}', 'g'), modelName)
        .replace(new RegExp('{{@controllerName}}', 'g'), cName)
        .replace('{{@_modelPath}}', _modelPathName);

      if (!isCreate) {
        return model;
      }
      const tmpFile = cPath + cName + '.ts';
      const fullPath = filePath + cName + '.ts';
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
        commandString += 'command `mkdir -p ' + cPath + '`\n';
      }
      if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, model);
        commandString += 'writing new file `' + tmpFile + '`\n';
      } else {
        fs.writeFileSync(fullPath, model);
        commandString += 'overwriting file `' + tmpFile + '`\n';
      }
      return commandString;
    } catch (e) {
      commandString += e.message;
    }
    return commandString;
  }
}

export default ReadCrud;
