import { MODELS } from './constants';
import * as fs from 'fs';
import * as _path from 'path';
import Dami from '../../app/Dami';

class ReadRbac {
  static async checkInit() {
    return await Dami.db
      .query('SHOW TABLES')
      .then((e1: object[]) => {
        let flag = false;
        if (e1.length > 0) {
          e1.forEach((e: object) => {
            const val = Object.values(e)[0];
            if (val.includes(MODELS.ACTION)) {
              flag = true;
            }
          });
        }
        return flag;
      });
  }

  static async redo() {
    const rbacQuery = fs.readFileSync(__dirname + '/../resource/db/rbac.mysql', 'utf8');
    return Dami.db
      .query(rbacQuery)
      .then(() => {
        return true;
      });
  }
}
export default ReadRbac;
