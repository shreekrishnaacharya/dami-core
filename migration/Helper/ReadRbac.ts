import { Connection } from '../../models/Connection';
import { MODELS, TableList } from './constants';
import * as fs from 'fs';
import * as _path from 'path';

class ReadRbac {
  static async checkInit() {
    return await Connection.mysql
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
    return Connection.mysql
      .query(rbacQuery)
      .then(() => {
        return true;
      });
  }
}
export default ReadRbac;
