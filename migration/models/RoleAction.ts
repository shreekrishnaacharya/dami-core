import { ActiveRecords } from '../../index';
import QueryBuild from '../../models/QueryBuild';
import { MODELS } from '../Helper/constants';
class RoleAction extends ActiveRecords {
  constructor() {
    super(MODELS.ROLE);
    this.init();
  }

  rules = () => {
    return {
      id: ['number'],
      fk_role_id: ['required', 'number'],
      fk_action_id: ['required', 'number'],
      allow: ['number'],
    };
  };

  // updateState(){
  //     const query=`UPDATE some_table SET status=IF(status=1, 0, 1)`;
  // }
  getActionsByRole(id: string) {
    const qModel = new QueryBuild();
    const query = `SELECT 
        ${MODELS.ACTION}.name as action,
        ${MODELS.ACTION}.id as action_id 
        FROM ${MODELS.ROLE_ACTION} 
        LEFT JOIN ${MODELS.ACTION} ON ${MODELS.ROLE_ACTION}.fk_action_id=${MODELS.ACTION}.id
        WHERE fk_role_id=?`;
    return this.createCommand(qModel.query(query, [id]).build()).queryAll();
  }
}
export default RoleAction;
