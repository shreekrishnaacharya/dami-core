import IController from '../controllers/IController';

export default interface IMiddleWare {
  controller: IController;
  run: (req, res, next) => void;
}
