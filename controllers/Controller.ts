import { NextFunction, Request, Response } from 'express';
import DataProvider from '../helpers/DataProvider';
import HttpCode from '../helpers/HttpCode';
import BaseController from './BaseController';
import Methods from './Methods';
import { IRoute } from './Route';

abstract class Controller<Model> extends BaseController<Model> {
  // model:any;
  constructor(model?: any) {
    super(model);
  }

  /**          
   *  @Index action
   *  this action list the data
   */
  index = async (req: Request, res: Response, next: NextFunction) => {
    const model = this.getModelExtend();
    const dataProvider = new DataProvider({ request: req, response: res });
    try {
      dataProvider.setModel(model);
      const result = await dataProvider.getList();
      res.send(result.toJson());
    } catch (err) {
      console.log(err);
      res.status(HttpCode.INTERNAL_SERVER_ERROR).send({});
    }
    next();
  };

  /**
          @Create action
          this action create the data
          ----------------------------
          this can also be use as follow
  
          ```
          this.getModelExtend().onResult((result)=>{
              if(result==null){
                 res.status(HttpCode.NOT_FOUND).send({});
              }
              result.onResult((result)=>{
                  if(result){
                      res.status(HttpCode.ACCEPTED).send({});
                  }else{
                      res.status(HttpCode.NOT_FOUND).send({});
                  }
              })
              .delete();
          }).findOne(req.params.id);
          ```
      */
  create = async (req: Request, res: Response, next: NextFunction) => {
    const model = this.getModelExtend();
    try {
      if (model.load(req.body)) {
        if (await model.save()) {
          // return HttpCode.ACCEPTED on success
          res.status(HttpCode.ACCEPTED).send(model.toJson());
        } else {
          // return unprocessable status
          res.status(HttpCode.UNPROCESSABLE_ENTITY).send({});
        }
      } else {
        res.status(HttpCode.BAD_REQUEST).send({});
      }
    } catch (err) {
      console.log(err);
      res.status(HttpCode.INTERNAL_SERVER_ERROR).send({});
    }
    next();
  };

  /**
    *  @View action
    *  this action view the data
    *  ----------------------------
    *  this can also be use as follow
    * 
    *  ```
    *  this.getModelExtend().onResult((model) => {
    *      if (model === null) {
    *          return res.send("not found");
    *      }else{
    *          // return not found status
    *          res.status(HttpCode.NOT_FOUND).send({}); 
    *      }
    *  }).asModel().findOne(req.params.id);
    *  ```
  */
  view = async (req: Request, res: Response, next: NextFunction) => {
    const model = this.getModelExtend();
    try {
      // if empty it will return null else it will return a model with data
      await model.findOne(req.params.id);
      if (model.isEmpty) {
        res.status(HttpCode.NOT_FOUND).end();
      } else {
        res.send(model.toJson());
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(HttpCode.INTERNAL_SERVER_ERROR);
    }
    next();
  };

  /*
          @Update action
          this action update the data
          ----------------------------
          this can also be use as follow
  
          ```
          this.getModelExtend().onResult((model) => {
              if (model === null) {
                  return res.send("not found");
              }
              model.load(req.body)
                  .onResult(([model, upCount]) => {
                      if (upCount) {
                          // return HttpCode.ACCEPTED on success
                          res.status(HttpCode.ACCEPTED).send({}); 
                      } else {
                          // return not found status
                          res.status(HttpCode.NOT_FOUND).send({}); 
                      }
                      next();
                  }).update();
          }).asModel().findOne(req.params.id);
          ```
      */
  update = async (req: Request, res: Response, next: NextFunction) => {
    const model = this.getModelExtend();
    try {
      if (model.load(req.body)) {
        if (await model.update(req.params.id)) {
          // return HttpCode.ACCEPTED on success
          res.status(HttpCode.ACCEPTED).send({});
        } else {
          // return not found status
          res.status(HttpCode.NOT_FOUND).send({});
        }
      } else {
        res.status(HttpCode.BAD_REQUEST).send({});
      }
    } catch (err) {
      res.status(HttpCode.INTERNAL_SERVER_ERROR).send({});
    }
    next();
  };
  /*
          @Delete action
          this action deletes the data
          ----------------------------
          this can also be use as follow
  
          ```
          this.getModelExtend().onResult((result)=>{
              if(result==null){
                 res.status(HttpCode.NOT_FOUND).send({});
              }
              result.onResult((result)=>{
                  if(result){
                      res.status(HttpCode.ACCEPTED).send({});
                  }else{
                      res.status(HttpCode.NOT_FOUND).send({});
                  }
              })
              .delete();
          }).findOne(req.params.id);
          ```
      */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    // create new instant of model
    const model = this.getModelExtend();
    try {
      // delete operation
      if (await model.delete(req.params.id)) {
        res.status(HttpCode.ACCEPTED).send({});
      } else {
        res.status(HttpCode.NOT_FOUND).send({});
      }
    } catch (err) {
      res.status(HttpCode.INTERNAL_SERVER_ERROR).send({});
    }
    next();
  };
  /*
          @Route function
          this function holds the defination for routes for actions in controllers
          ----------------------------
          It is array of object that has 3 values as method, path, action
          method : it type of Methods which id one of get,post,put,delete
          path   : url path to the action
          action : name of method to execute
          ```
      */
  route = (): IRoute[] => {
    if (!this.hasModel()) {
      return [];
    }
    return [
      { method: Methods.GET, path: '/', action: 'index' },
      { method: Methods.POST, path: '/', action: 'create' },
      { method: Methods.GET, path: '/:id', action: 'view' },
      { method: Methods.PUT, path: '/:id', action: 'update' },
      { method: Methods.DELETE, path: '/:id', action: 'delete' },
    ];
  };
}

export default Controller;
