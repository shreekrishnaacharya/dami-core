import { ActiveRecords } from '../../index';
import { Query } from '../../models/Connection';
import { MODELS } from '../Helper/constants';
import Actions from './Actions';
import RoleAction from './RoleAction';
class Role extends ActiveRecords {
  constructor() {
    super(MODELS.ROLE);
    this.init();
  }

  rules = () => {
    return {
      id: ['number'],
      name: ['required', 'string', { max: 100 }],
      description: ['required', 'string'],
      status: ['number'],
    };
  };

  afterSave(type: string): void {
    if (type === Query.INSERT) {
      const action = new Actions();
      action
        .asObject()
        .onResult((result: any[]) => {
          const insert = [];
          for (const res of result) {
            /* tslint:disable:no-string-literal */
            insert.push([this.getValue('id'), res['id']]);
          }
          const roleAction = new RoleAction();
          roleAction.insertAll(['fk_role_id', 'fk_action_id'], insert);
        })
        .findAll();
    }
  }
}
export default Role;
