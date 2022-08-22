import { Request, Response } from 'express';
import { Connection } from '../models/Connection';
import IActiveModel from '../models/IActiveModel';
import QueryBuild from '../models/QueryBuild';

enum DPType {
  DESC = 'desc',
  ASC = 'asc',
  RESPONSE = 'response',
  REQUEST = 'request',
  SORT = 'sort',
  SIZE = 'size',
  TOTAL_COUNT = 'total_count',
  PAGE_SIZE = 'size',
  PAGE = 'page'
}
interface DpConfig {
  request: Request;
  response: Response;
  sort?: object;
  size?: number;
  page?: number;
}
export default class DataProvider {
  private model: IActiveModel;
  private queryModel: QueryBuild;
  private sortBy: object;
  private totalCount: number;
  private page: number;
  private pageOffset: number;
  private pageSize: number;
  private attributes: object;
  private config: DpConfig;
  private request: Request;
  private response: Response;
  private DEFAULT_PAGE_SIZE = 10;

  constructor(config: DpConfig) {
    this.config = {
      request: null,
      response: null,
      size: this.DEFAULT_PAGE_SIZE,
      page: 1,
      ...config,
    };
    this.sortBy = { id: DPType.DESC };
    this.request = this.config[DPType.REQUEST];
    this.response = this.config[DPType.RESPONSE];
    if (this.config.hasOwnProperty(DPType.SORT)) {
      this.sortBy = this.config[DPType.SORT];
    }
    this.pageOffset = 0;
    this.pageSize = this.config[DPType.SIZE];
    this.getload();
  }
  setModel(model: IActiveModel) {
    this.model = model;
    this.queryModel = model.getBuild();
    return this;
  }

  getList(): Promise<any> {
    // load query
    const queryAttr = this.model.filterAttribute(this.request.query);
    for (const nam of Object.keys(queryAttr)) {
      this.queryModel.andFilterWhere(['like', this.model.getTable() + '.' + nam, queryAttr[nam]]);
    }
    const promish1 = Connection.mysql.query(this.queryModel.build(true));
    promish1.then((result) => {
      this.totalCount = parseInt(result[0][DPType.TOTAL_COUNT], 10);
      return result[0];
    });
    const sortAttr = this.model.filterAttribute(this.sortBy);
    if (Object.keys(sortAttr).length > 0) {
      this.queryModel.orderBy(sortAttr);
    }
    if (this.pageSize > 0) {
      this.queryModel.limit(this.pageSize);
    } else {
      this.queryModel.limit(this.DEFAULT_PAGE_SIZE);
    }
    if (this.pageOffset > -1) {
      this.queryModel.offset(this.pageOffset);
    } else {
      this.queryModel.offset(0);
    }

    const promish2 = this.model.setBuild(this.queryModel);
    return Promise.all([promish1, promish2]).then((val) => {
      this.response.setHeader('x-pagination-per-page', this.pageSize);
      this.response.setHeader('x-pagination-page-count', val[1].size());
      this.response.setHeader('x-pagination-current-page', this.page);
      this.response.setHeader('x-pagination-total-count', this.totalCount);
      return val[1];
    });
  }

  query(callback: (query: QueryBuild) => QueryBuild): this {
    this.queryModel = callback(this.queryModel);
    return this;
  }

  private getload(): void {
    if (this.request.query.hasOwnProperty(DPType.SORT)) {
      const scream = this.request.query.sort.toString();
      if (scream.charAt(0) === '-') {
        this.sortBy = { [scream.substring(1)]: DPType.DESC };
      } else {
        this.sortBy = { [scream]: DPType.ASC };
      }
    }
    if (this.request.query.hasOwnProperty(DPType.PAGE_SIZE)) {
      this.pageSize = parseInt(this.request.query.size.toString(), 10);
    } else {
      this.pageSize = this.DEFAULT_PAGE_SIZE;
    }
    if (this.request.query.hasOwnProperty(DPType.PAGE)) {
      this.page = parseInt(this.request.query.page.toString(), 10);
    } else {
      this.page = this.config[DPType.PAGE];
    }
    this.pageOffset = (this.page - 1) * this.pageSize;
  }
}
