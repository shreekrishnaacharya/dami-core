import BaseController from '../controllers/BaseController';

export default interface IMiddleWare {
  controller: BaseController<any>;
  run: (req, res, next) => void;
}
