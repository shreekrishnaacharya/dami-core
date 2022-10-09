import { MODELS } from '../Helper/constants';
import { ActiveRecords } from '@damijs/mysql';
class Actions extends ActiveRecords {
  constructor() {
    super(MODELS.ACTION);
    this.init();
  }
  rules = () => {
    return {
      id: ['number'],
      name: ['required', 'string', { max: 200 }],
      action: ['required', 'string', { max: 200 }],
      method: ['required', 'string', { max: 6 }],
      parent_id: ['number'],
      can_update: ['number'],
      allow: ['number'],
      status: ['number'],
    };
  };
}
export default Actions;
