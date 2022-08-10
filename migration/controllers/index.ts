import CrudController from './CrudController';
import ControlController from './ControlController';
import ModelController from './ModelController';
import DamiController from './DamiController';

const ContorllerList = {
  model: new ModelController(),
  crud: new CrudController(),
  control: new ControlController()
};
export default ContorllerList;
