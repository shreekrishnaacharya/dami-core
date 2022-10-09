import Dami from '../app/Dami';
import Actions from '../migration/models/Actions';
import { camelToText } from './TextHelper';
import CTypes from '../config/ConfigTypes'
import { ListModel } from '@damijs/mysql';
enum CListType {
  NAME = 'name',
  ACTION = 'action',
  METHOD = 'method'
}
export async function initRbac() {
  const controllerList = {};
  const controllers = Dami[CTypes.CONTROLLER];
  for (const control of Object.keys(controllers)) {
    const controller = controllers[control];
    controller.setPath(`/${control}`);
    const routList = controller.route();
    for (const actions of Object.keys(routList)) {
      const { path, method, action } = routList[actions];
      controllerList['/' + control + path.substring(0, path.indexOf('/:')) + '/' + method] = {
        name: camelToText(action),
        action: '/' + control + path.substring(0, path.indexOf('/:')),
        method,
      };
    }
  }
  const actionModel = new Actions();
  const result = <ListModel<any>>await actionModel.asObject().findAll();
  const insert = [];
  const update = [];
  for (const { id, name, action, method } of result) {
    if (controllerList.hasOwnProperty(action + '/' + method)) {
      if (controllerList[action + '/' + method][CListType.NAME] !== name) {
        update.push([
          {
            name: controllerList[action + '/' + method][CListType.NAME],
            status: 1,
          },
          { id },
        ]);
      }
      delete controllerList[action + '/' + method];
    } else {
      update.push([
        {
          name,
          status: 0,
        },
        { id },
      ]);
    }
  }
  for (const cl of Object.keys(controllerList)) {
    insert.push([controllerList[cl][CListType.NAME], controllerList[cl][CListType.ACTION], controllerList[cl][CListType.METHOD]]);
  }
  if (insert.length > 0) {
    actionModel.insertAll([CListType.NAME, CListType.ACTION, CListType.METHOD], insert);
  }
  for (const [up, con] of update) {
    actionModel.updateAll(up, con);
  }
}
