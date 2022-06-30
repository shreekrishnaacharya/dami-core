import { MODELS } from '../Helper/constants';
import { ActiveRecords } from '../../index';
class UserRole extends ActiveRecords {
  constructor() {
    super(MODELS.USER_ROLE);
    this.init();
  }

  rules = () => {
    return {
      id: ['number'],
      fk_user_id: ['required', 'number'],
      fk_role_id: ['required', 'number'],
    };
  };
}
export default UserRole;
